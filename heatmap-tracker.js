(function() {
    const supabaseUrl = 'https://tbhyzovkwpetnpyumblb.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiaHl6b3Zrd3BldG5weXVtYmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDUxOTksImV4cCI6MjEwMzU4MTE5OX0._P132KIv3H6q7bYFXxrnfcyEoSUNabfnqjovO9SinLU'; // Pega tu llave de Supabase aquí

    // Generar un ID de sesión único
    const sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    let coordinates = [];
    let lastMoveTime = 0;

    // Rastrear movimiento de mouse (Throttling de 150ms)
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMoveTime > 150) {
            // Cambio crucial: usar pageX y pageY para registrar el scroll real
            coordinates.push({ x: e.pageX, y: e.pageY, type: 'move' });
            lastMoveTime = now;
        }
    });

    // Rastrear clics exactos
    document.addEventListener('click', (e) => {
        coordinates.push({ x: e.pageX, y: e.pageY, type: 'click' });
    });

    // Enviar datos por lotes justo al salir de la página
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && coordinates.length > 0) {
            const payload = {
                session_id: sessionId,
                url: window.location.href,
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                coordinates: coordinates
            };

            // keepalive garantiza que el request termine en el background aunque se cierre la pestaña
            fetch(`${supabaseUrl}/rest/v1/heatmap_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload),
                keepalive: true 
            });
            
            coordinates = []; // Limpiar memoria tras el envío
        }
    });
})();
