import React, { useState, useRef, useMemo, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Sun, Moon, Terminal, Heart, Flag,
  Eye, EyeOff, MousePointerClick, Search, Github,
  Map, Activity, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Lock, Unlock
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
    colors: {
      person: '#ffc107',
      company: '#0dcaf0',
      movement: '#dc3545',
      location: '#198754',
      default: '#adb5bd'
    },
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
    colors: {
      person: '#ffb7b2',
      company: '#a2d2ff',
      movement: '#ffadad',
      location: '#b5e48c',
      default: '#e2ece9'
    },
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
    colors: {
      person: '#ffd54f',
      company: '#64b5f6',
      movement: '#e57373',
      location: '#81c784',
      default: '#9e9e9e'
    },
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
    colors: {
      person: '#ffffff',
      company: '#00ff00',
      movement: '#ff0000',
      location: '#00ffff',
      default: '#444444'
    },
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
    colors: {
      person: '#d52b1e',
      company: '#0039a6',
      movement: '#ffffff',
      location: '#808080',
      default: '#000000'
    },
    labelBg: '#ffffff',
    labelBorder: '#0039a6'
  }
};

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const GlobalStyles = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;500&display=swap');

    body {
      margin: 0;
      background-color: ${theme.bg};
      font-family: ${theme.font};
      color: ${theme.textColor};
      overflow: hidden;
      transition: background 0.3s ease;
    }

    .grid-bg {
      background-size: 50px 50px;
      background-image:
        linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px);
      height: 100vh;
      width: 100vw;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      pointer-events: none;
    }

    .theme-btn {
      background: transparent;
      border: 1px solid ${theme.accent};
      color: ${theme.textColor};
      padding: 10px 15px;
      margin-bottom: 8px;
      cursor: pointer;
      border-radius: 6px;
      font-family: ${theme.font};
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
      opacity: 0.8;
    }

    .theme-btn:hover,
    .theme-btn.active {
      background: ${theme.accent};
      color: ${theme.bg === '#000000' || theme.bg === '#121212' ? '#000' : '#fff'};
      opacity: 1;
      font-weight: bold;
      transform: translateX(5px);
    }

    .view-mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }
  `}</style>
);

export default function InteractiveMap() {
  const [currentTheme, setCurrentTheme] = useState('normal');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const navigate = useNavigate();
  const cyRef = useRef(null);
  const theme = THEMES[currentTheme];

  useEffect(() => {
    if (!cyRef.current) return;

    const timeout = setTimeout(() => {
      const cy = cyRef.current;

      const currentZoom = cy.zoom();
      const currentPan = cy.pan();

      cy.resize();

      cy.zoom(currentZoom);
      cy.pan(currentPan);
    }, 320);

    return () => clearTimeout(timeout);
  }, [isPanelCollapsed]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    if (isUnlocked) {
      cy.nodes().unlock();
      cy.panningEnabled(true);
      cy.userPanningEnabled(true);
    } else {
      cy.nodes().lock();
      cy.panningEnabled(true);
      cy.userPanningEnabled(true);
    }
  }, [isUnlocked]);

  const getAdaptiveFontSize = (zoom) => {
    const baseSize = 14;
    const scale = 1 / zoom;
    return Math.min(Math.max(baseSize, baseSize * scale * 0.9), 30);
  };

  const cyStylesheet = useMemo(() => {
    const getType = (ele) => (ele.data('type') || ele.data('group') || '').toLowerCase();

    const getNodeImage = (ele) => {
      const publicUrl = process.env.PUBLIC_URL;
      if (ele.data('image')) return `${publicUrl}/images/${ele.data('image')}`;
      const t = getType(ele);
      if (t === 'maltego.attackpattern') return `${publicUrl}/images/Attackpattern.png`;
      if (t === 'maltego.company') return `${publicUrl}/images/Company.png`;
      if (t === 'maltego.educationinstitution') return `${publicUrl}/images/EducationInstitution.png`;
      if (t === 'maltego.gang') return `${publicUrl}/images/Gang.png`;
      if (t === 'maltego.incident') return `${publicUrl}/images/Incident.png`;
      if (t === 'maltego.industry') return `${publicUrl}/images/Industry.png`;
      if (t === 'maltego.onlinegroup') return `${publicUrl}/images/Onlinegroup.png`;
      if (t === 'maltego.organization') return `${publicUrl}/images/Organization.png`;
      if (t === 'maltego.religiousgroup') return `${publicUrl}/images/ReligiousGroup.png`;
      return undefined;
    };

    const getNodeColor = (ele) => {
      const t = getType(ele);
      if (!t) return theme.colors.default;
      if (t.includes('person')) return theme.colors.person;
      if (t.includes('company') || t.includes('organization') || t.includes('industry') || t.includes('institution') || t.includes('religious')) return theme.colors.company;
      if (t.includes('political') || t.includes('attack') || t.includes('movement')) return theme.colors.movement;
      if (t.includes('country') || t.includes('location')) return theme.colors.location;
      return theme.colors.default;
    };

    const getNodeSize = (ele) => {
      const t = getType(ele);
      if (t.includes('attack')) return 85;
      if (
        t.includes('company') ||
        t.includes('organization') ||
        t.includes('industry') ||
        t.includes('institution') ||
        t.includes('group') ||
        t.includes('religious')
      ) return 65;
      return 45;
    };

    const getLabelWithEmoji = (ele) => {
      const label = ele.data('label') || '';
      const t = getType(ele);
      if (t.includes('country')) return `🇺🇸 ${label}`;
      if (t.includes('attack') || t.includes('movement') || t.includes('political') || t.includes('incident')) {
        return `${label}`;
      }
      return label;
    };

    return [
      {
        selector: 'node',
        style: {
          'width': (ele) => getNodeSize(ele),
          'height': (ele) => getNodeSize(ele),
          'background-image': (ele) => getNodeImage(ele),
          'background-fit': 'cover',
          'background-color': (ele) => getNodeImage(ele) ? '#ffffff' : getNodeColor(ele),
          'border-width': theme.nodeBorder,
          'border-color': theme.id === 'hacker' ? '#0f0' : (theme.id === 'patriota' ? '#0039a6' : '#333'),
          'border-style': theme.id === 'coquette' ? 'double' : 'solid',
          'label': (ele) => getLabelWithEmoji(ele),
          'color': theme.textColor,
          'font-family': theme.font,
          'font-weight': 'bold',
          'font-size': 14,
          'text-background-color': theme.labelBg,
          'text-background-opacity': 0.85,
          'text-background-padding': '4px',
          'text-background-shape': 'roundrectangle',
          'text-border-width': 1,
          'text-border-color': theme.labelBorder,
          'text-border-opacity': 0.8,
          'text-valign': 'bottom',
          'text-margin-y': 10,
          'text-wrap': 'wrap',
          'text-max-width': 200,
          'z-index': 10
        }
      },
      {
        selector: '.faded',
        style: {
          'text-opacity': 0,
          'text-background-opacity': 0,
          'text-border-opacity': 0,
          'opacity': 0.3
        }
      },
      {
        selector: '.priority',
        style: {
          'text-opacity': 1,
          'opacity': 1,
          'z-index': 9999
        }
      },
      {
        selector: 'edge',
        style: {
          'width': (ele) => (ele.data('width') || 1) * 3,
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'line-style': 'data(style)',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.5,
          'opacity': 0.8,
          'label': 'data(label)',
          'color': theme.textColor,
          'font-size': 11,
          'text-rotation': 'autorotate',
          'text-background-color': theme.labelBg,
          'text-background-opacity': 1,
          'text-background-padding': '3px',
          'text-background-shape': 'roundrectangle',
          'text-border-opacity': 1,
          'text-border-width': 1,
          'text-border-color': theme.labelBorder
        }
      },
      {
        selector: ':selected',
        style: {
          'border-width': 6,
          'border-color': theme.accent,
          'width': 100,
          'height': 100,
          'z-index': 10000
        }
      }
    ];
  }, [theme]);

  const layoutConfig = useMemo(() => ({ name: 'preset', fit: true, padding: 50 }), []);

  const handleZoom = (cy) => {
    const z = cy.zoom();
    setZoomLevel(z);
    const newFontSize = getAdaptiveFontSize(z);
    const newEdgeFontSize = Math.min(Math.max(10, newFontSize * 0.85), 25);

    cy.batch(() => {
      cy.nodes().style('font-size', newFontSize);
      cy.edges().style('font-size', newEdgeFontSize);

      if (z < 0.35) {
        cy.nodes().forEach(node => {
          const t = (node.data('type') || node.data('group') || '').toLowerCase();
          const isPriority =
            t.includes('company') ||
            t.includes('movement') ||
            t.includes('country') ||
            t.includes('gang') ||
            t.includes('person') ||
            t.includes('industry') ||
            t.includes('organization') ||
            t.includes('institution') ||
            t.includes('attack') ||
            t.includes('group') ||
            t.includes('religious');

          if (isPriority) {
            node.removeClass('faded').addClass('priority');
            node.style('font-size', Math.min(newFontSize * 1.3, 40));
          } else {
            node.addClass('faded').removeClass('priority');
          }
        });
      } else {
        cy.nodes().removeClass('faded priority');
      }
    });
  };

  return (
    <>
      <GlobalStyles theme={theme} />
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div className="grid-bg"></div>

        { }
        <button
          onClick={() => {
            setIsUnlocked(prev => !prev);
            if (navigator.vibrate && /Mobi|Android/i.test(navigator.userAgent)) {
              navigator.vibrate(40);
            }
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 9999,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: isUnlocked ? '#dc3545' : '#198754',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, background 0.2s'
          }}
          title={isUnlocked ? 'Bloquear nodos (modo navegación)' : 'Desbloquear nodos para editarlos'}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
        </button>

        { }
        <div
          style={{
            width: isPanelCollapsed ? '60px' : '320px',
            minWidth: isPanelCollapsed ? '60px' : '320px',
            height: '100vh',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            background: theme.panelBg,
            borderRight: `1px solid ${theme.id === 'hacker' ? '#0f0' : '#e0e0e0'}`,
            backdropFilter: 'blur(10px)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '5px 0 25px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          { }
          <div
            style={{
              height: '70px',
              minHeight: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isPanelCollapsed ? 'center' : 'space-between',
              padding: isPanelCollapsed ? '0' : '0 20px',
              borderBottom: `1px solid ${theme.labelBorder}`
            }}
          >
            {!isPanelCollapsed && (
              <div
                style={{
                  fontWeight: '800',
                  fontSize: '1.2rem',
                  letterSpacing: '-0.5px',
                  color: theme.accent,
                  whiteSpace: 'nowrap'
                }}
              >
                CHICAGO BOTS
              </div>
            )}

            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.textColor,
                cursor: 'pointer',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'transform 0.2s'
              }}
              title={isPanelCollapsed ? 'Expandir' : 'Colapsar'}
            >
              {isPanelCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
          </div>

          { }
          <div style={{
            width: '320px',
            flex: 1,
            opacity: isPanelCollapsed ? 0 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: isPanelCollapsed ? 'none' : 'auto',
            overflowY: 'auto',
            paddingBottom: '20px',
            scrollbarGutter: 'stable both-edges',
            paddingRight: '10px'
          }}>

            <div style={{ padding: '20px' }}>
              <h2
                style={{
                  margin: '0 0 15px 0',
                  fontSize: '0.9rem',
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Modo de Visualización
              </h2>
              <div
                style={{
                  display: 'flex',
                  background: theme.bg === '#121212' ? '#333' : '#e9ecef',
                  padding: 4,
                  borderRadius: 8
                }}
              >
                <div
                  className="view-mode-btn"
                  style={{
                    background: theme.panelBg,
                    color: theme.accent,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    cursor: 'default'
                  }}
                >
                  <Activity size={16} /> Interactivo
                </div>
                <div
                  className="view-mode-btn"
                  style={{ cursor: 'pointer', opacity: 0.6 }}
                  onClick={() => navigate('/static-view')}
                >
                  <Map size={16} /> Imagen Fija
                </div>
              </div>
            </div>

            <div style={{ borderBottom: `1px solid ${theme.labelBorder}` }}>
              <button
                onClick={() => setIsStyleOpen(!isStyleOpen)}
                style={{
                  width: '100%',
                  padding: '20px',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: theme.textColor,
                  fontFamily: theme.font
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={22} strokeWidth={1.5} />
                  <span
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      letterSpacing: '-0.5px'
                    }}
                  >
                    ESTILO VISUAL
                  </span>
                </div>
                {isStyleOpen ? (
                  <ChevronUp size={20} opacity={0.6} />
                ) : (
                  <ChevronDown size={20} opacity={0.6} />
                )}
              </button>

              {isStyleOpen && (
                <div
                  style={{
                    padding: '0 20px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    animation: 'fadeIn 0.2s'
                  }}
                >
                  <button
                    className={`theme-btn ${currentTheme === 'normal' ? 'active' : ''}`}
                    onClick={() => setCurrentTheme('normal')}
                  >
                    <Sun size={18} /> Normal
                  </button>
                  <button
                    className={`theme-btn ${currentTheme === 'coquette' ? 'active' : ''}`}
                    onClick={() => setCurrentTheme('coquette')}
                  >
                    <Heart size={18} /> Coquette
                  </button>
                  <button
                    className={`theme-btn ${currentTheme === 'dark' ? 'active' : ''}`}
                    onClick={() => setCurrentTheme('dark')}
                  >
                    <Moon size={18} /> Dark
                  </button>
                  <button
                    className={`theme-btn ${currentTheme === 'hacker' ? 'active' : ''}`}
                    onClick={() => setCurrentTheme('hacker')}
                  >
                    <Terminal size={18} /> Hacker
                  </button>
                  <button
                    className={`theme-btn ${currentTheme === 'patriota' ? 'active' : ''}`}
                    onClick={() => setCurrentTheme('patriota')}
                  >
                    <Flag size={18} /> Patriota
                  </button>
                </div>
              )}
            </div>

            <div
              style={{
                padding: '15px 20px',
                fontSize: '0.85rem',
                fontWeight: 500,
                opacity: 0.8,
                borderBottom: `1px solid ${theme.labelBorder}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>ZOOM: {(zoomLevel * 100).toFixed(0)}%</span>
              {zoomLevel < 0.35 ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: theme.accent
                  }}
                >
                  <Eye size={16} /> VISTA SATELITAL
                </span>
              ) : (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <EyeOff size={16} /> MODO DETALLE
                </span>
              )}
            </div>

            <div style={{ padding: '20px' }}>
              {selectedNode ? (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      marginBottom: '15px'
                    }}
                  >
                    {(() => {
                      const t = (selectedNode.type || selectedNode.group || '').toLowerCase();
                      const publicUrl = process.env.PUBLIC_URL;
                      let imgSrc = undefined;

                      if (selectedNode.image) imgSrc = `${publicUrl}/images/${selectedNode.image}`;
                      else if (t === 'maltego.attackpattern') imgSrc = `${publicUrl}/images/Attackpattern.png`;
                      else if (t === 'maltego.company') imgSrc = `${publicUrl}/images/Company.png`;
                      else if (t === 'maltego.educationalinstitution') imgSrc = `${publicUrl}/images/EducationInstitution.png`;
                      else if (t === 'maltego.gang') imgSrc = `${publicUrl}/images/Gang.png`;
                      else if (t === 'maltego.incident') imgSrc = `${publicUrl}/images/Incident.png`;
                      else if (t === 'maltego.industry') imgSrc = `${publicUrl}/images/Industry.png`;
                      else if (t === 'maltego.onlinegroup') imgSrc = `${publicUrl}/images/Onlinegroup.png`;
                      else if (t === 'maltego.organization') imgSrc = `${publicUrl}/images/Organization.png`;
                      else if (t === 'maltego.religiousgroup') imgSrc = `${publicUrl}/images/ReligiousGroup.png`;

                      if (imgSrc) {
                        return (
                          <img
                            src={imgSrc}
                            alt="profile"
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: `3px solid ${theme.accent}`,
                              background: '#fff'
                            }}
                          />
                        );
                      } else {
                        return (
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              background: theme.colors.default,
                              border: `3px solid ${theme.accent}`
                            }}
                          ></div>
                        );
                      }
                    })()}

                    <div style={{ whiteSpace: 'normal' }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          opacity: 0.6,
                          textTransform: 'uppercase'
                        }}
                      >
                        {(selectedNode.type || selectedNode.group || 'Entity').replace('maltego.', '')}
                      </div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: '800',
                          lineHeight: 1.1,
                          color: theme.id === 'patriota' ? '#d52b1e' : theme.textColor
                        }}
                      >
                        {selectedNode.label}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginBottom: '15px',
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'column'
                    }}
                  >
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(selectedNode.label)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-btn"
                      style={{
                        justifyContent: 'center',
                        width: '90%',
                        textDecoration: 'none',
                        margin: 0
                      }}
                    >
                      <Search size={16} /> Buscar en Google
                    </a>
                    <a
                      href="https://github.com/chicagobots/chicagobots/blob/main/Fuentes.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-btn"
                      style={{
                        justifyContent: 'center',
                        width: '90%',
                        textDecoration: 'none',
                        margin: 0
                      }}
                    >
                      <Github size={16} /> Ver fuentes
                    </a>
                  </div>

                  <div
                    style={{
                      padding: '15px',
                      background: theme.bg,
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      border: `1px solid ${theme.nodeBorder ? theme.labelBorder : 'transparent'}`
                    }}
                  >
                    <p style={{ margin: '6px 0' }}>
                      <strong>ID REF:</strong> {selectedNode.id}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>POS X:</strong> {selectedNode.position?.x?.toFixed(0)}
                    </p>
                    <p style={{ margin: '6px 0' }}>
                      <strong>POS Y:</strong> {selectedNode.position?.y?.toFixed(0)}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    opacity: 0.5,
                    fontStyle: 'italic',
                    fontSize: '0.95rem',
                    textAlign: 'center',
                    marginTop: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <MousePointerClick size={32} strokeWidth={1.5} />
                  Selecciona un nodo
                  <br />
                  para ver su expediente.
                </div>
              )}
            </div>

            <div
              style={{
                padding: '15px',
                textAlign: 'center',
                fontSize: '0.75rem',
                opacity: 0.5,
                borderTop: `1px solid ${theme.labelBorder}`
              }}
            >
              {graphData.nodes?.length || graphData.length || 0} Elementos en Red
            </div>
          </div>
        </div>

        { }
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
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
                cy.fit();
                cy.data('loaded', true);
                cy.nodes().lock();
                handleZoom(cy);
              }

              const debouncedZoom = debounce(() => handleZoom(cy), 50);
              cy.off('zoom');
              cy.on('zoom', debouncedZoom);

              cy.off('tap');
              cy.on('tap', 'node', (evt) => {
                const node = evt.target;
                setSelectedNode({ ...node.data(), position: node.position() });
              });
              cy.on('tap', (evt) => {
                if (evt.target === cy) setSelectedNode(null);
              });
            }}
          />
        </div>
      </div>
    </>
  );
}
