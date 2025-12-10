import React, { useState, useRef, useMemo, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Activity, Map, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Lock, Unlock,
  ArrowRightCircle, ArrowLeftCircle, Search, MousePointerClick
} from 'lucide-react';
import graphData from './data.json';

const THEMES = {
  normal: {
    id: 'normal',
    name: 'Normal',
    bg: '#f8f9fa',
    gridColor: 'rgba(0,0,0,0.06)',
    font: '"Segoe UI", Helvetica, Arial, sans-serif',
    panelBg: 'rgba(255, 255, 255, 0.95)',
    textColor: '#212529',
    nodeBorder: 1,
    accent: '#0d6efd',
    colors: { person: '#ffc107', company: '#0dcaf0', movement: '#dc3545', location: '#198754', default: '#adb5bd' },
    labelBg: '#ffffff',
    labelBorder: '#dee2e6'
  },
  coquette: {
    id: 'coquette',
    name: 'Coquette',
    bg: '#fff0f5',
    gridColor: 'rgba(255, 182, 193, 0.3)',
    font: '"Playfair Display", serif',
    panelBg: 'rgba(255, 250, 250, 0.9)',
    textColor: '#d63384',
    nodeBorder: 3,
    accent: '#ff69b4',
    colors: { person: '#ffb7b2', company: '#a2d2ff', movement: '#ffadad', location: '#b5e48c', default: '#e2ece9' },
    labelBg: '#fff5f8',
    labelBorder: '#ffc2d1'
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    bg: '#121212',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    font: '"Roboto", sans-serif',
    panelBg: 'rgba(30, 30, 30, 0.95)',
    textColor: '#e0e0e0',
    nodeBorder: 0,
    accent: '#bb86fc',
    colors: { person: '#ffd54f', company: '#64b5f6', movement: '#e57373', location: '#81c784', default: '#9e9e9e' },
    labelBg: '#1e1e1e',
    labelBorder: '#333333'
  },
  hacker: {
    id: 'hacker',
    name: 'Hacker',
    bg: '#000000',
    gridColor: 'rgba(0, 255, 0, 0.15)',
    font: '"Fira Code", monospace',
    panelBg: 'rgba(0, 20, 0, 0.95)',
    textColor: '#00ff00',
    nodeBorder: 2,
    accent: '#00ff00',
    colors: { person: '#ffffff', company: '#00ff00', movement: '#ff0000', location: '#00ffff', default: '#444444' },
    labelBg: '#000000',
    labelBorder: '#00ff00'
  },
  patriota: {
    id: 'patriota',
    name: 'Patriota',
    bg: '#ffffff',
    gridColor: 'rgba(0, 57, 166, 0.1)',
    font: '"Arial", sans-serif',
    panelBg: 'rgba(255, 255, 255, 0.98)',
    textColor: '#0039a6',
    nodeBorder: 2,
    accent: '#d52b1e',
    colors: { person: '#d52b1e', company: '#0039a6', movement: '#ffffff', location: '#808080', default: '#000000' },
    labelBg: '#ffffff',
    labelBorder: '#0039a6'
  }
};

const GlobalStyles = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;500&display=swap');
    body { margin: 0; background-color: ${theme.bg}; font-family: ${theme.font}; color: ${theme.textColor}; overflow: hidden; transition: background 0.3s ease; }
    .grid-bg {
      background-size: 50px 50px;
      background-image: linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px);
      height: 100vh; width: 100vw; position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none;
    }
    .theme-btn {
      background: transparent; border: 1px solid ${theme.accent}; color: ${theme.textColor}; padding: 10px 15px; margin-bottom: 8px; cursor: pointer; border-radius: 6px; font-family: ${theme.font}; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: all 0.2s; opacity: 0.8;
    }
    .theme-btn:hover, .theme-btn.active { background: ${theme.accent}; color: ${theme.bg === '#000000' || theme.bg === '#121212' ? '#000' : '#fff'}; opacity: 1; font-weight: bold; transform: translateX(5px); }
    .view-mode-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .relation-item { padding: 8px; border-bottom: 1px solid ${theme.gridColor}; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
    .relation-item:hover { background: ${theme.gridColor}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }
  `}</style>);

export default function InteractiveMap() {
  const [currentTheme, setCurrentTheme] = useState('normal');
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConnections, setNodeConnections] = useState({ incoming: [], outgoing: [] });
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const cyRef = useRef(null);
  const theme = THEMES[currentTheme];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!cyRef.current) return;
    const timeout = setTimeout(() => { cyRef.current.resize(); }, 320);
    return () => clearTimeout(timeout);
  }, [isPanelCollapsed, isMobile]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    if (isUnlocked) {
      cy.nodes().unlock(); cy.panningEnabled(true); cy.userPanningEnabled(true);
    } else {
      cy.nodes().lock(); cy.panningEnabled(true); cy.userPanningEnabled(true);
    }
  }, [isUnlocked]);

  const getNodeIcon = (nodeData) => {
    const publicUrl = process.env.PUBLIC_URL;
    if (nodeData.image) return `${publicUrl}/images/${nodeData.image}`;

    const t = (nodeData.type || nodeData.group || '').toLowerCase();
    if (t.includes('attack')) return `${publicUrl}/images/Attackpattern.png`;
    if (t.includes('company')) return `${publicUrl}/images/Company.png`;
    if (t.includes('education')) return `${publicUrl}/images/EducationInstitution.png`;
    if (t.includes('gang')) return `${publicUrl}/images/Gang.png`;
    if (t.includes('incident')) return `${publicUrl}/images/Incident.png`;
    if (t.includes('industry')) return `${publicUrl}/images/Industry.png`;
    if (t.includes('online')) return `${publicUrl}/images/Onlinegroup.png`;
    if (t.includes('organization')) return `${publicUrl}/images/Organization.png`;
    if (t.includes('religious')) return `${publicUrl}/images/ReligiousGroup.png`;
    return null;
  };

  const cyStylesheet = useMemo(() => {
    const getNodeColor = (ele) => {
      const t = (ele.data('type') || ele.data('group') || '').toLowerCase();
      if (!t) return theme.colors.default;
      if (t.includes('person')) return theme.colors.person;
      if (t.includes('company') || t.includes('organization')) return theme.colors.company;
      if (t.includes('political') || t.includes('attack')) return theme.colors.movement;
      if (t.includes('country') || t.includes('location')) return theme.colors.location;
      return theme.colors.default;
    };

    return [
      {
        selector: 'node',
        style: {
          'width': 45, 'height': 45,
          'background-image': (ele) => getNodeIcon(ele.data()),
          'background-fit': 'cover',
          'background-color': (ele) => getNodeIcon(ele.data()) ? '#ffffff' : getNodeColor(ele),
          'border-width': theme.nodeBorder,
          'border-color': theme.id === 'hacker' ? '#0f0' : (theme.id === 'patriota' ? '#0039a6' : '#333'),
          'label': 'data(label)',
          'color': theme.textColor,
          'font-size': 14,
          'text-background-color': theme.labelBg,
          'text-background-opacity': 0.85,
          'text-background-padding': '4px',
          'text-background-shape': 'roundrectangle',
          'z-index': 10
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': (ele) => ele.data('color') || '#999',
          'target-arrow-color': (ele) => ele.data('color') || '#999',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'opacity': 0.4,
          'label': 'data(label)',
          'text-rotation': 'autorotate',
          'font-size': 10,
          'text-opacity': 0.6,
          'color': theme.textColor,
          'text-background-opacity': 0
        }
      },
      {
        selector: '.faded',
        style: {
          'opacity': 0.25,
          'text-opacity': 0.2,
          'z-index': 0
        }
      },
      {
        selector: '.highlighted',
        style: {
          'width': 70, 'height': 70, 'border-width': 6, 'border-color': theme.accent,
          'z-index': 9998, 'opacity': 1, 'text-opacity': 1, 'font-weight': 'bold', 'font-size': 16
        }
      },
      {
        selector: '.main-highlight',
        style: {
          'width': 100, 'height': 100, 'border-width': 10, 'border-color': theme.accent,
          'z-index': 9999, 'opacity': 1, 'text-opacity': 1, 'font-weight': 'bold', 'font-size': 20
        }
      },
      {
        selector: 'edge.highlighted',
        style: {
          'width': 10,
          'line-color': '#ff0000',
          'target-arrow-color': '#ff0000',
          'source-arrow-color': '#ff0000',
          'arrow-scale': 2,
          'opacity': 1,
          'text-opacity': 1,
          'z-index': 9999,
          'label': 'data(label)',
          'text-rotation': 'autorotate',
          'text-margin-y': -20,
          'color': '#ffffff',
          'text-outline-color': '#000000',
          'text-outline-width': 4,
          'font-weight': '900',
          'font-size': 24,
          'text-background-opacity': 0
        }
      },
      { selector: ':selected', style: { 'border-width': 6, 'border-color': theme.accent, 'width': 60, 'height': 60 } }
    ];
  }, [theme]);

  const handleSelectNode = (node) => {
    const cy = cyRef.current;
    if (!cy) return;

    if (node.hasClass('main-highlight')) {
      clearSelection();
      return;
    }

    setSelectedNode({ ...node.data(), position: node.position() });

    if (isMobile && isPanelCollapsed) setIsPanelCollapsed(false);

    const outEdges = node.outgoers('edge');
    const outgoingList = outEdges.map(edge => ({ edgeLabel: edge.data('label') || 'relacionado con', targetNode: edge.target().data() }));
    const inEdges = node.incomers('edge');
    const incomingList = inEdges.map(edge => ({ edgeLabel: edge.data('label') || 'relacionado con', sourceNode: edge.source().data() }));
    setNodeConnections({ incoming: incomingList, outgoing: outgoingList });

    cy.batch(() => {
      cy.elements().removeClass('highlighted faded main-highlight');
      cy.elements().addClass('faded');
      node.removeClass('faded').addClass('main-highlight');
      const neighbors = node.neighborhood();
      neighbors.removeClass('faded').addClass('highlighted');
      node.connectedEdges().removeClass('faded').addClass('highlighted');
    });
  };

  const handleSelectEdge = (edge) => {
    const cy = cyRef.current;
    if (!cy) return;

    if (edge.hasClass('highlighted') && !selectedNode) {
      clearSelection();
      return;
    }

    setSelectedNode(null);
    setNodeConnections({ incoming: [], outgoing: [] });

    cy.batch(() => {
      cy.elements().removeClass('highlighted faded main-highlight');
      cy.elements().addClass('faded');
      edge.removeClass('faded').addClass('highlighted');
      edge.source().removeClass('faded').addClass('highlighted');
      edge.target().removeClass('faded').addClass('highlighted');
    });
  };

  const clearSelection = () => {
    const cy = cyRef.current;
    if (!cy) return;
    setSelectedNode(null);
    setNodeConnections({ incoming: [], outgoing: [] });
    cy.batch(() => { cy.elements().removeClass('highlighted faded main-highlight'); });
  };

  const layoutConfig = useMemo(() => ({ name: 'preset', fit: true, padding: 50 }), []);

  const panelStyles = isMobile
    ? { width: '100vw', height: isPanelCollapsed ? '60px' : '50vh', bottom: 0, left: 0, borderTop: `1px solid ${theme.labelBorder}`, borderRight: 'none', flexDirection: 'column' }
    : {
      width: isPanelCollapsed ? '60px' : '320px',
      minWidth: isPanelCollapsed ? '60px' : '320px',
      flexShrink: 0,
      height: '100vh', top: 0, left: 0,
      borderRight: `1px solid ${theme.labelBorder}`,
      borderTop: 'none', flexDirection: 'column'
    };

  return (
    <>
      <GlobalStyles theme={theme} />
      <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', flexDirection: isMobile ? 'column' : 'row' }}>
        <div className="grid-bg"></div>

        <button onClick={() => setIsUnlocked(prev => !prev)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 9999, width: '46px', height: '46px', borderRadius: '50%', background: isUnlocked ? '#dc3545' : '#198754', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
        </button>

        <div style={{ ...panelStyles, position: isMobile ? 'absolute' : 'relative', zIndex: 50, background: theme.panelBg, backdropFilter: 'blur(10px)', display: 'flex', boxShadow: '0 0 25px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
          <div style={{ height: '60px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: isPanelCollapsed ? 'center' : 'space-between', padding: isPanelCollapsed ? '0' : '0 20px', borderBottom: `1px solid ${theme.labelBorder}`, width: '100%', boxSizing: 'border-box' }}>
            {(!isPanelCollapsed || isMobile) && <div style={{ fontWeight: '800', fontSize: '1.2rem', color: theme.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isMobile && isPanelCollapsed ? 'CHICAGO BOTS' : 'CHICAGO BOTS'}</div>}
            <button onClick={() => setIsPanelCollapsed(!isPanelCollapsed)} style={{ background: 'transparent', border: 'none', color: theme.textColor, cursor: 'pointer', padding: '10px' }}>
              {isMobile ? (isPanelCollapsed ? <ChevronUp size={24} /> : <ChevronDown size={24} />) : (isPanelCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />)}
            </button>
          </div>

          <div style={{ width: isMobile ? '100vw' : '320px', height: isMobile ? 'calc(50vh - 60px)' : '100%', flex: 1, opacity: isPanelCollapsed ? 0 : 1, transition: 'opacity 0.2s', overflowY: 'auto', paddingBottom: '20px', pointerEvents: isPanelCollapsed ? 'none' : 'auto' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', background: theme.bg === '#121212' ? '#333' : '#e9ecef', padding: 4, borderRadius: 8, marginBottom: '15px' }}>
                <div className="view-mode-btn" style={{ background: theme.panelBg, color: theme.accent, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}><Activity size={16} /> Interactivo</div>
                <div className="view-mode-btn" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => navigate('/static-view')}><Map size={16} /> Imagen Fija</div>
              </div>

              <button onClick={() => setIsStyleOpen(!isStyleOpen)} style={{ width: '100%', padding: '15px', background: 'transparent', border: `1px solid ${theme.labelBorder}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.textColor, marginBottom: '10px', cursor: 'pointer' }}>
                <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Settings size={18} /> ESTILO VISUAL</span>
                {isStyleOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isStyleOpen && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                    {['normal', 'coquette', 'dark', 'hacker', 'patriota'].map(t => (
                      <button key={t} className={`theme-btn ${currentTheme === t ? 'active' : ''}`} onClick={() => setCurrentTheme(t)} style={{ justifyContent: 'center', margin: 0 }}>{t.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: 1, padding: '0 20px 20px 20px' }}>
              {selectedNode ? (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: theme.colors.default, border: `3px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {getNodeIcon(selectedNode) && <img src={getNodeIcon(selectedNode)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.6, textTransform: 'uppercase' }}>{(selectedNode.type || 'Entity').replace('maltego.', '')}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', lineHeight: 1.1, color: theme.accent }}>{selectedNode.label}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    {nodeConnections.incoming.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: theme.colors.movement, borderBottom: `2px solid ${theme.colors.movement}`, paddingBottom: '5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ArrowLeftCircle size={16} /> Entrantes ({nodeConnections.incoming.length})
                        </h4>
                        <div style={{ background: theme.bg, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${theme.labelBorder}` }}>
                          {nodeConnections.incoming.map((conn, idx) => {
                            const iconSrc = getNodeIcon(conn.sourceNode);
                            return (
                              <div key={idx} className="relation-item" onClick={() => {
                                const targetNode = cyRef.current.$id(conn.sourceNode.id);
                                if (targetNode.length) handleSelectNode(targetNode);
                              }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: theme.colors.default, border: `1px solid ${theme.labelBorder}`, flexShrink: 0 }}>
                                  {iconSrc && <img src={iconSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 'bold' }}>{conn.sourceNode.label}</div>
                                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>via: {conn.edgeLabel}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {nodeConnections.outgoing.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: theme.colors.location, borderBottom: `2px solid ${theme.colors.location}`, paddingBottom: '5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ArrowRightCircle size={16} /> Salientes ({nodeConnections.outgoing.length})
                        </h4>
                        <div style={{ background: theme.bg, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${theme.labelBorder}` }}>
                          {nodeConnections.outgoing.map((conn, idx) => {
                            const iconSrc = getNodeIcon(conn.targetNode);
                            return (
                              <div key={idx} className="relation-item" onClick={() => {
                                const targetNode = cyRef.current.$id(conn.targetNode.id);
                                if (targetNode.length) handleSelectNode(targetNode);
                              }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: theme.colors.default, border: `1px solid ${theme.labelBorder}`, flexShrink: 0 }}>
                                  {iconSrc && <img src={iconSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 'bold' }}>{conn.targetNode.label}</div>
                                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>→ {conn.edgeLabel}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(selectedNode.label)}`} target="_blank" rel="noopener noreferrer" className="theme-btn" style={{ justifyContent: 'center', margin: 0 }}>
                      <Search size={16} /> Buscar en Google
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.95rem', textAlign: 'center', marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <MousePointerClick size={32} strokeWidth={1.5} />
                  Selecciona un nodo<br />para ver conexiones.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', height: '100%', order: isMobile ? 1 : 2 }}>
          <CytoscapeComponent
            elements={graphData}
            style={{ width: '100%', height: '100%' }}
            layout={layoutConfig}
            stylesheet={cyStylesheet}
            wheelSensitivity={2}
            minZoom={0.05}
            maxZoom={4}
            boxSelectionEnabled={false}
            autounselectify={!isUnlocked}
            cy={(cy) => {
              cyRef.current = cy;
              if (!cy.data('loaded')) {
                cy.fit(); cy.data('loaded', true); cy.nodes().lock();
              }
              cy.off('tap');
              cy.on('tap', 'node', (evt) => handleSelectNode(evt.target));
              cy.on('tap', 'edge', (evt) => handleSelectEdge(evt.target));
              cy.on('tap', (evt) => { if (evt.target === cy) clearSelection(); });
            }}
          />
        </div>
      </div>
    </>
  );
}