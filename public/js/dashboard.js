// Dashboard JavaScript

// Platform config templates
const configTemplates = {
    telegram: {
        botToken: '',
        chatId: ''
    },
    facebook: {
        pageId: '',
        accessToken: ''
    },
    discord: {
        webhookUrl: ''
    },
    slack: {
        webhookUrl: ''
    }
};

// Show add config modal
function showAddConfigModal() {
    document.getElementById('modalTitle').textContent = 'Add Platform';
    document.getElementById('platform').disabled = false;
    document.getElementById('platform').value = '';
    document.getElementById('configFields').innerHTML = '';
    document.getElementById('configModal').style.display = 'block';
}

// Close config modal
function closeConfigModal() {
    document.getElementById('configModal').style.display = 'none';
}

// Platform select change
document.getElementById('platform')?.addEventListener('change', function () {
    const platform = this.value;
    const fieldsDiv = document.getElementById('configFields');

    if (!platform || !configTemplates[platform]) {
        fieldsDiv.innerHTML = '';
        return;
    }

    const template = configTemplates[platform];
    let html = '';

    for (const [key, value] of Object.entries(template)) {
        html += `
            <div class="form-group">
                <label for="${key}">${formatLabel(key)}</label>
                <input type="text" id="${key}" name="${key}" value="${value}" required>
            </div>
        `;
    }

    fieldsDiv.innerHTML = html;
});

// Format label
function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

// Submit config form
document.getElementById('configForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const platform = document.getElementById('platform').value;
    const configData = {};

    const template = configTemplates[platform];
    for (const key of Object.keys(template)) {
        configData[key] = document.getElementById(key).value;
    }

    try {
        const response = await fetch('/api/configs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                platform,
                enabled: true,
                configData
            })
        });

        if (response.ok) {
            alert('Platform configured successfully!');
            location.reload();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Toggle config
async function toggleConfig(platform, enabled) {
    try {
        const response = await fetch(`/api/configs/${platform}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled })
        });

        if (!response.ok) {
            throw new Error('Failed to toggle config');
        }
    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

// Edit config
async function editConfig(platform) {
    try {
        const response = await fetch('/api/configs');
        const configs = await response.json();
        const config = configs.find(c => c.platform === platform);

        if (!config) return;

        document.getElementById('modalTitle').textContent = 'Edit Platform';
        document.getElementById('platform').value = platform;
        document.getElementById('platform').disabled = true;

        // Trigger change event to show fields
        const event = new Event('change');
        document.getElementById('platform').dispatchEvent(event);

        // Fill in current values
        const configData = JSON.parse(config.config_data);
        setTimeout(() => {
            for (const [key, value] of Object.entries(configData)) {
                const field = document.getElementById(key);
                if (field) field.value = value;
            }
        }, 100);

        document.getElementById('configModal').style.display = 'block';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Delete config
async function deleteConfig(platform) {
    if (!confirm(`Are you sure you want to delete ${platform} configuration?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/configs/${platform}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Platform deleted successfully!');
            location.reload();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('configModal');
    if (event.target === modal) {
        closeConfigModal();
    }
}
