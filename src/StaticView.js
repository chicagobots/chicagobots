import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function StaticView() {
    const navigate = useNavigate();
    const staticMapUrl = process.env.PUBLIC_URL + "/static_map/index.html";

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

            { }
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    background: '#0d6efd',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <ArrowLeft size={20} /> VOLVER AL MODO INTERACTIVO
            </button>

            { }
            <iframe
                src={staticMapUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    transformOrigin: 'center',
                }}
                title="Mapa Estático"
            />
        </div>
    );
}