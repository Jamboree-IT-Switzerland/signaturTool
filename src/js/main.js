class SignatureGenerator {
    constructor() {
        this.config = null;
        this.translations = null;
        this.currentLanguage = 'de';
        this.init();
    }

    async init() {
        try {
            await this.loadConfigurations();
            this.setupEventListeners();
            this.updateLanguage(this.currentLanguage);
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to load application configuration');
        }
    }

    async loadConfigurations() {
        try {
            const [configResponse, translationsResponse] = await Promise.all([
                fetch('config/app-config.json'),
                fetch('config/translations.json')
            ]);

            if (!configResponse.ok || !translationsResponse.ok) {
                throw new Error('Failed to load configuration files');
            }

            this.config = await configResponse.json();
            this.translations = await translationsResponse.json();
        } catch (error) {
            throw new Error('Configuration loading failed: ' + error.message);
        }
    }

    setupEventListeners() {
        // Language switcher
        document.querySelectorAll('.langue a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = this.getLangFromHref(link.href);
                this.updateLanguage(lang);
            });
        });

        // Form submission
        const form = document.querySelector('#signatureForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateSignature();
            });
        }

        // Role change handler for hiding/showing subsector
        const roleSelect = document.querySelector('#role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                this.handleRoleChange(e.target.value);
            });
        }
    }

    getLangFromHref(href) {
        if (href.includes('FR') || href.includes('fr')) return 'fr';
        if (href.includes('IT') || href.includes('it')) return 'it';
        return 'de';
    }

    updateLanguage(lang) {
        this.currentLanguage = lang;

        // Update active language indicator
        document.querySelectorAll('.langue li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('.langue a').forEach(link => {
            const linkLang = this.getLangFromHref(link.href);
            if (linkLang === lang) {
                link.parentElement.classList.add('active');
            }
        });

        // Update UI text
        this.updateUIText();
    }

    updateUIText() {
        const ui = this.translations.ui[this.currentLanguage];

        // Update title
        document.title = ui.title;

        // Update form labels and placeholders
        const elements = {
            '.info:first-of-type': ui.myInfo,
            '.info:last-of-type': ui.myRole,
            '.gender-select h2': ui.gender,
            'label[for="male"]': ui.male,
            'label[for="female"]': ui.female,
            'input[name="firstname"]': { placeholder: ui.namePlaceholder },
            'input[name="pfadiName"]': { placeholder: ui.pfadiPlaceholder },
            'input[name="phone"]': { placeholder: ui.phonePlaceholder },
            'input[name="mail"]': { placeholder: ui.emailPlaceholder },
            '#role option[value=""]': ui.rolePlaceholder,
            'select[name="Comission"] option[value=""]': ui.sectorPlaceholder,
            'input[name="subSector"]': { placeholder: ui.subSectorPlaceholder },
            '.button': { value: ui.submitButton }
        };

        Object.entries(elements).forEach(([selector, content]) => {
            const element = document.querySelector(selector);
            if (element) {
                if (typeof content === 'object') {
                    Object.assign(element, content);
                } else {
                    element.textContent = content;
                }
            }
        });

        // Update role options
        this.updateRoleOptions();
        this.updateSectorOptions();
    }

    updateRoleOptions() {
        const roleSelect = document.querySelector('#role');
        if (!roleSelect) return;

        // Keep the first empty option, update the rest
        const options = roleSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => {
            const roleKey = option.value;
            if (this.translations.roles[roleKey]) {
                // Use the German role name as display text (original behavior)
                const germanRole = this.translations.roles[roleKey].de.male;
                if (germanRole) {
                    option.textContent = this.getGermanRoleDisplayName(roleKey);
                }
            }
        });
    }

    getGermanRoleDisplayName(roleKey) {
        const roleMap = {
            'Responsable de camp': 'Lagerleiter',
            'Responsable de commission': 'Ressortleiter',
            'Responsable de sous commission': 'Bereichsleiter',
            'Responsable de sous sous commission': 'Teilbereichsleiter',
            'Colaborateur': 'Mitarbeiter',
            'none': '-'
        };
        return roleMap[roleKey] || roleKey;
    }

    updateSectorOptions() {
        const sectorSelect = document.querySelector('select[name="Comission"]');
        if (!sectorSelect) return;

        const options = sectorSelect.querySelectorAll('option:not([value=""])');
        options.forEach(option => {
            const sectorKey = option.value;
            if (this.translations.sectors[sectorKey]) {
                // Use German sector name for display
                option.textContent = this.translations.sectors[sectorKey].de;
            }
        });
    }

    handleRoleChange(role) {
        const subSectorInput = document.querySelector('input[name="subSector"]');
        if (!subSectorInput) return;

        // Hide subsector for "Responsable de commission" (Ressortleiter)
        if (role === 'Responsable de commission') {
            subSectorInput.style.display = 'none';
            subSectorInput.value = '';
        } else {
            subSectorInput.style.display = 'block';
        }
    }

    validateForm(formData) {
        const errors = [];

        // Check required fields
        this.config.form.validation.required.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`${field} is required`);
            }
        });

        // Validate email
        if (formData.mail && !new RegExp(this.config.form.validation.emailPattern).test(formData.mail)) {
            errors.push('Invalid email format');
        }

        // Validate phone (if provided)
        if (formData.phone && !new RegExp(this.config.form.validation.phonePattern).test(formData.phone)) {
            errors.push('Invalid phone format');
        }

        return errors;
    }

    generateSignature() {
        const form = document.querySelector('#signatureForm');
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Validate form
        const errors = this.validateForm(data);
        if (errors.length > 0) {
            this.showError('Please fill in all required fields correctly');
            return;
        }

        // Generate signature HTML
        const signatureHTML = this.buildSignatureHTML(data);

        // Show signature
        this.displaySignature(signatureHTML);
    }

    buildSignatureHTML(data) {
        const role = data.role;
        const sector = data.Comission;
        const subSector = data.subSector || '';
        const gender = data.gender;

        // Get translated roles and sectors for all languages
        const roleTranslations = this.getRoleTranslations(role, gender);
        const sectorTranslations = this.getSectorTranslations(sector);

        // Handle spacing and subsector display
        let space = ', ';
        let displaySubSector = subSector;

        if (role === 'Responsable de commission' || role === 'none') {
            space = '';
            displaySubSector = '';
        }

        const signatureLines = [];

        // Build signature lines for each language
        ['fr', 'de', 'it'].forEach(lang => {
            const roleText = roleTranslations[lang] || '';
            const sectorText = sectorTranslations[lang] || '';

            if (roleText || sectorText) {
                const line = `${roleText}${displaySubSector ? ' ' + displaySubSector : ''}${space}${sectorText}`;
                signatureLines.push(line);
            } else {
                signatureLines.push('');
            }
        });

        return `
            <table id="t01">
                <tr>
                    <th>
                        <img src="${this.config.signature.logoPath}" alt="Mova logo" height="${this.config.signature.logoHeight}">
                    </th>
                    <th style="margin: 0; padding: 0; line-height: 15px">
                        <p style="font-weight: 700; margin: 0; text-align: left; font-family: '${this.config.signature.fontFamily}'; font-size: ${this.config.signature.fontSize}">${data.firstname}${data.pfadiName ? ' / ' + data.pfadiName : ''}</p>
                        <br>
                        ${signatureLines.map(line =>
            `<p style="margin: 0; text-align: left; font-family: '${this.config.signature.fontFamily}'; font-size: ${this.config.signature.fontSize}; font-weight: 300">${line}</p>`
        ).join('')}
                        <br>
                        <p style="margin: 0; text-align: left; font-family: '${this.config.signature.fontFamily}'; font-size: ${this.config.signature.fontSize}; font-weight: 300">${data.phone || ''}</p>
                        <p style="margin: 0; text-align: left; font-family: '${this.config.signature.fontFamily}'; font-size: ${this.config.signature.fontSize}; font-weight: 300">${data.mail || ''}</p>
                        <p style="margin: 0; text-align: left; font-family: '${this.config.signature.fontFamily}'; font-size: ${this.config.signature.fontSize}; font-weight: 300">${this.config.signature.websiteUrl}</p>
                    </th>
                </tr>
            </table>
        `;
    }

    getRoleTranslations(role, gender) {
        const roleData = this.translations.roles[role];
        if (!roleData) return { fr: '', de: '', it: '' };

        return {
            fr: roleData.fr[gender] || '',
            de: roleData.de[gender] || '',
            it: roleData.it[gender] || ''
        };
    }

    getSectorTranslations(sector) {
        const sectorData = this.translations.sectors[sector];
        if (!sectorData) return { fr: '', de: '', it: '' };

        return {
            fr: sectorData.fr || '',
            de: sectorData.de || '',
            it: sectorData.it || ''
        };
    }

    displaySignature(signatureHTML) {
        // Hide form and show signature
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="signature-result">
                <div class="signature-actions">
                    <button onclick="app.copySignatureHTML()" class="button">Copy HTML</button>
                    <button onclick="app.resetForm()" class="button">Create New Signature</button>
                </div>
                <div class="signature-display">
                    ${signatureHTML}
                </div>
            </div>
        `;
    }

    copySignatureHTML() {
        const signatureHTML = document.querySelector('.signature-display').innerHTML;
        navigator.clipboard.writeText(signatureHTML).then(() => {
            this.showSuccess('Signature HTML copied to clipboard!');
        }).catch(() => {
            this.showError('Failed to copy to clipboard');
        });
    }

    resetForm() {
        location.reload();
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SignatureGenerator();
});
