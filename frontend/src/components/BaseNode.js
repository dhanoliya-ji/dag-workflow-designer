// BaseNode.js
// The single component every node in the pipeline is built from.
//
// A node is described by a plain config object (see nodes/nodeConfigs.js);
// BaseNode turns that description into chrome, fields, handles and state
// wiring. Node authors never touch layout, styling or the store.
//
// `fields` and `handles` may each be a static array or a function of
// { id, data } — the function form is what lets a node derive its handles
// from its own live state (the Text node's {{variables}} do exactly that).
// --------------------------------------------------

import { useEffect, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { NodeField } from './NodeField';
import './BaseNode.css';

const POSITIONS = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const resolve = (value, ctx) => (typeof value === 'function' ? value(ctx) : value);

const handleKey = (nodeId, handle) => handle.id || `${nodeId}-${handle.name}`;

// Spreads handles evenly along their edge: two handles on a side sit at
// 33%/66%, three at 25%/50%/75%, and so on.
const offsetFor = (index, total) => `${((index + 1) / (total + 1)) * 100}%`;

export const BaseNode = ({ id, data, selected, config }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const pruneNodeHandles = useStore((state) => state.pruneNodeHandles);

  const ctx = useMemo(() => ({ id, data }), [id, data]);
  const fields = useMemo(() => resolve(config.fields, ctx) || [], [config, ctx]);
  const handles = useMemo(() => resolve(config.handles, ctx) || [], [config, ctx]);

  const grouped = useMemo(() => {
    return handles.reduce((groups, handle) => {
      const side = handle.position || (handle.type === 'source' ? 'right' : 'left');
      (groups[side] = groups[side] || []).push(handle);
      return groups;
    }, {});
  }, [handles]);

  // When a data-driven handle disappears, any edge attached to it must go too.
  const handleIds = handles.map((handle) => handleKey(id, handle)).join('|');
  useEffect(() => {
    pruneNodeHandles(id, handleIds ? handleIds.split('|') : []);
  }, [id, handleIds, pruneNodeHandles]);

  const valueOf = (field) => {
    const current = data?.[field.name];
    if (current !== undefined) return current;
    const fallback = resolve(field.default, ctx);
    return fallback === undefined ? '' : fallback;
  };

  return (
    <div
      className={`base-node${selected ? ' base-node--selected' : ''}`}
      style={{
        '--node-accent': `var(--accent-${config.accent || 'blue'})`,
        width: config.width || 240,
      }}
    >
      <header className="base-node__header">
        <span className="base-node__icon" aria-hidden="true">
          {config.icon}
        </span>
        <div className="base-node__titles">
          <h3 className="base-node__title">{config.label}</h3>
          {config.description && (
            <p className="base-node__subtitle">{config.description}</p>
          )}
        </div>
      </header>

      {fields.length > 0 && (
        <div className="base-node__body">
          {fields.map((field) => (
            <NodeField
              key={field.name}
              field={{ ...field, nodeId: id }}
              value={valueOf(field)}
              onChange={(value) => updateNodeField(id, field.name, value)}
            />
          ))}
        </div>
      )}

      {config.footer && <footer className="base-node__footer">{resolve(config.footer, ctx)}</footer>}

      {Object.entries(grouped).map(([side, sideHandles]) =>
        sideHandles.map((handle, index) => {
          const key = handleKey(id, handle);
          const isVertical = side === 'left' || side === 'right';
          const offset = offsetFor(index, sideHandles.length);

          return (
            <Handle
              key={key}
              id={key}
              type={handle.type}
              position={POSITIONS[side]}
              className="base-node__handle"
              style={isVertical ? { top: offset } : { left: offset }}
            >
              {handle.label && (
                <span className={`base-node__handle-label base-node__handle-label--${side}`}>
                  {handle.label}
                </span>
              )}
            </Handle>
          );
        })
      )}
    </div>
  );
};
