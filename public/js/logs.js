// Logs JavaScript

// View log details
async function viewLog(id) {
    try {
        const response = await fetch(`/api/logs/${id}`);
        const log = await response.json();

        let html = `
            <div class="log-detail">
                <p><strong>ID:</strong> #${log.id}</p>
                <p><strong>Post ID:</strong> ${log.post_id || 'N/A'}</p>
                <p><strong>Title:</strong> ${log.post_title || 'N/A'}</p>
                <p><strong>URL:</strong> <a href="${log.post_url}" target="_blank">${log.post_url}</a></p>
                <p><strong>Status:</strong> <span class="badge badge-${log.status === 'success' ? 'success' : 'error'}">${log.status}</span></p>
                <p><strong>Time:</strong> ${new Date(log.created_at).toLocaleString('vi-VN')}</p>
                
                ${log.error_message ? `
                    <div class="alert alert-error">
                        <strong>Error:</strong> ${log.error_message}
                    </div>
                ` : ''}
                
                ${log.payload ? `
                    <div class="mt-4">
                        <strong>Payload:</strong>
                        <pre style="background: #f8fafc; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px;">${JSON.stringify(JSON.parse(log.payload), null, 2)}</pre>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('logDetails').innerHTML = html;
        document.getElementById('logModal').style.display = 'block';
    } catch (error) {
        alert('Error loading log: ' + error.message);
    }
}

// Close log modal
function closeLogModal() {
    document.getElementById('logModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('logModal');
    if (event.target === modal) {
        closeLogModal();
    }
}
