/**
 * Scout Leader Assignment Tool
 * Helps assign leaders to groups based on preferences with drag-and-drop
 */

// ==================== PERSON CLASS ====================
class Person {
    constructor(naam, preferences, priorities, gender, hasDriversLicense) {
        this.naam = naam;
        this.preferences = preferences; // { tak1, tak2, tak3 }
        this.priorities = priorities;   // { metWie: [], nietMet: [], prioriteit: 1-10 }
        this.gender = gender; // 'M' or 'V' (Man or Vrouw)
        this.hasDriversLicense = hasDriversLicense; // true or false
        this.assignedGroup = null;
        this.score = 0;
    }

    /**
     * Calculate satisfaction score for assigned group
     * Two separate scores: takscore (group preference) and groupscore (co-leaders)
     * Final score is weighted average based on priority preference
     * Returns: score 0-100 (higher is better)
     */
    calculateScore(allAssignments) {
        if (!this.assignedGroup) return 0;

        // === TAKSCORE: How well does this group match their preferences? (0-100) ===
        let takscore = 0;
        const prefGroups = [this.preferences.tak1, this.preferences.tak2, this.preferences.tak3];
        
        if (prefGroups.includes(this.assignedGroup)) {
            if (this.preferences.tak1 === this.assignedGroup) {
                takscore = 100; // First choice - perfect
            } else if (this.preferences.tak2 === this.assignedGroup) {
                takscore = 66; // Second choice - good
            } else if (this.preferences.tak3 === this.assignedGroup) {
                takscore = 33; // Third choice - acceptable
            }
        }
        // If not in preferences, takscore stays 0

        // === GROUPSCORE: How well do the co-leaders match their preferences? (0-100) ===
        let groupscore = 100; // Start at perfect satisfaction

        const groupMembers = allAssignments
            .filter(p => p.assignedGroup === this.assignedGroup && p.naam !== this.naam)
            .map(p => p.naam.toLowerCase().trim());

        const desired = (this.priorities.metWie || []).map(n => n.toLowerCase().trim()).filter(n => n);
        const undesired = (this.priorities.nietMet || []).map(n => n.toLowerCase().trim()).filter(n => n);

        // Smaller increments per person, not 100-point drops.
        const desiredStep = desired.length > 0 ? 30 / desired.length : 0;
        const undesiredStep = undesired.length > 0 ? 40 / undesired.length : 0;

        // Desired persons: reward presence, penalty missing.
        desired.forEach(name => {
            const found = groupMembers.some(member => member.includes(name) || name.includes(member));
            groupscore += found ? desiredStep : -desiredStep;
        });

        // Undesired persons: penalty presence, small reward for absent.
        undesired.forEach(name => {
            const found = groupMembers.some(member => member.includes(name) || name.includes(member));
            groupscore += found ? -undesiredStep : (undesired.length > 0 ? (20 / undesired.length) : 0);
        });

        groupscore = Math.max(0, Math.min(100, groupscore));

        // Clamp groupscore between 0 and 100
        groupscore = Math.max(0, Math.min(100, groupscore));

        // === BLEND SCORES based on PRIORITY ===
        // Priority scale: 1-3 = prefer tak, 4-6 = neutral, 7-10 = prefer co-leaders
        // Convert prioriteit (1-10) to weight (0-1) where:
        //   1 = weight 0 (100% takscore), 10 = weight 1 (100% groupscore)
        const prioriteit = Math.max(1, Math.min(10, Number(this.priorities.prioriteit) || 5));
        const weight = (prioriteit - 1) / 9;

        const finalScore = takscore * (1 - weight) + groupscore * weight;

        // Store individual scores for display if needed
        this.takscore = takscore;
        this.groupscore = groupscore;
        this.priority = prioriteit;

        return Math.max(0, Math.min(100, finalScore));
    }


    getScoreLevel() {
        if (this.score >= 70) return 'high';
        if (this.score >= 45) return 'medium';
        return 'low';
    }

    getScoreClass() {
        return `score-${this.getScoreLevel()}`;
    }
}

// ==================== APP STATE ====================
const app = {
    people: [],
    groups: new Set(),
    allAssignments: [], // Reference to all people for constraint checking

    // Load Excel file and parse data
    loadExcelFile(file) {
        // Check if XLSX library is loaded
        if (typeof XLSX === 'undefined') {
            this.showStatus(`✗ SheetJS bibliotheek laadt nog... Wacht even en probeer opnieuw`, 'error');
            console.error('XLSX library not loaded');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet);

                if (rows.length === 0) {
                    this.showStatus(`✗ Bestand bevat geen data rijen`, 'error');
                    return;
                }

                this.parseData(rows);
                this.render();
                this.showStatus(`✓ ${this.people.length} leiders ingeladen!`, 'success');
            } catch (error) {
                this.showStatus(`✗ Fout bij laden bestand: ${error.message}`, 'error');
                console.error('Error loading file:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    },

    // Parse Excel rows into Person objects
    parseData(rows) {
        this.people = [];
        this.groups = new Set();

        console.log('First row from Excel:', rows[0]); // Debug: show column names
        console.log('Total rows:', rows.length);

        rows.forEach((row, index) => {
            if (!row.Naam || row.Naam.toString().trim() === '') return;

            // Extract and clean data - handle both lowercase and uppercase column names
            const naam = row.Naam.toString().trim();
            const tak1 = (row.Tak1 || row.tak1) ? (row.Tak1 || row.tak1).toString().trim() : '';
            const tak2 = (row.Tak2 || row.tak2) ? (row.Tak2 || row.tak2).toString().trim() : '';
            const tak3 = (row.Tak3 || row.tak3) ? (row.Tak3 || row.tak3).toString().trim() : '';
            
            console.log(`Row ${index}: ${naam} - Tak1: ${tak1}, Tak2: ${tak2}, Tak3: ${tak3}`);
            
            // Collect all groups
            [tak1, tak2, tak3].forEach(t => {
                if (t) this.groups.add(t);
            });

            // Parse comma-separated collaboration preferences
            const metWie = (row.Met_wie || row.met_wie)
                ? (row.Met_wie || row.met_wie).toString().split(',').map(n => n.trim()).filter(n => n !== '')
                : [];
            
            const nietMet = (row.Niet_met || row.niet_met)
                ? (row.Niet_met || row.niet_met).toString().split(',').map(n => n.trim()).filter(n => n !== '')
                : [];

            // Parse priority (1-10, lower = prefer group, higher = prefer co-leaders)
            const prioriteit = Math.max(1, Math.min(10, parseInt(row.Prioriteit || row.prioriteit) || 5));

            // Parse gender (M/V or Man/Vrouw)
            const gender = (row.Geslacht || row.geslacht || row.Gender || row.gender || '').toString().trim().toUpperCase();
            const normalizedGender = gender === 'M' || gender === 'MAN' ? 'M' : gender === 'V' || gender === 'VROUW' ? 'V' : '';

            // Parse drivers license (Ja/Nee, Yes/No, 1/0, true/false)
            const driversLicense = (row.Rijbewijs || row.rijbewijs || row.DriversLicense || row.driversLicense || '').toString().trim().toLowerCase();
            const hasDriversLicense = driversLicense === 'ja' || driversLicense === 'yes' || driversLicense === '1' || driversLicense === 'true';

            const person = new Person(naam, { tak1, tak2, tak3 }, { metWie, nietMet, prioriteit }, normalizedGender, hasDriversLicense);
            this.people.push(person);
        });

        console.log('Groups found:', Array.from(this.groups));
        console.log('People created:', this.people.length);

        // Sort by name
        this.people.sort((a, b) => a.naam.localeCompare(b.naam));
        this.allAssignments = this.people; // Keep reference for scoring
    },

    // Render all UI elements
    render() {
        if (this.people.length === 0) return;

        console.log(`Rendering ${this.people.length} people and ${this.groups.size} groups`);

        // Show main area and stats
        document.getElementById('mainArea').style.display = 'block';
        document.getElementById('statsSection').style.display = 'block';

        this.renderStats();
        this.renderUnassigned();
        this.renderGroups();
        this.checkConflicts();
    },

    // Render statistics
    renderStats() {
        const assigned = this.people.filter(p => p.assignedGroup).length;
        const unassigned = this.people.length - assigned;
        const avgScore = this.people.length > 0
            ? (this.people.reduce((sum, p) => sum + p.score, 0) / this.people.length).toFixed(1)
            : 0;

        document.getElementById('totalPeople').textContent = this.people.length;
        document.getElementById('assignedCount').textContent = assigned;
        document.getElementById('unassignedCount').textContent = unassigned;
        document.getElementById('avgScore').textContent = assigned > 0 ? avgScore : '-';
    },

    // Render unassigned people list
    renderUnassigned() {
        const unassignedList = document.getElementById('unassignedList');
        unassignedList.innerHTML = '';

        const unassigned = this.people.filter(p => !p.assignedGroup);
        console.log(`Adding ${unassigned.length} unassigned people to list`);
        
        unassigned.forEach(person => {
            const card = this.createPersonCard(person);
            console.log(`Created card for ${person.naam}`);
            unassignedList.appendChild(card);
        });

        // Re-initialize sortable for unassigned list
        this.initSortable(unassignedList);
    },

    // Render group sections with assigned people
    renderGroups() {
        const groupsContainer = document.getElementById('groupsContainer');
        groupsContainer.innerHTML = '';

        // Sort groups for consistent order
        const sortedGroups = Array.from(this.groups).sort();

        sortedGroups.forEach(groupName => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';

            // Header
            const header = document.createElement('div');
            header.className = 'group-header';
            header.textContent = groupName;

            // Stats
            const stats = document.createElement('div');
            stats.className = 'group-stats';

            const groupMembers = this.people.filter(p => p.assignedGroup === groupName);
            const avgGroupScore = groupMembers.length > 0
                ? (groupMembers.reduce((sum, p) => sum + p.score, 0) / groupMembers.length).toFixed(0)
                : 0;

            const menCount = groupMembers.filter(p => p.gender === 'M').length;
            const womenCount = groupMembers.filter(p => p.gender === 'V').length;
            const driversCount = groupMembers.filter(p => p.hasDriversLicense).length;

            stats.innerHTML = `
                <span>
                    <span class="group-stats-value">${groupMembers.length}</span>
                    <span>Leiders</span>
                </span>
                <span>
                    <span class="group-stats-value">${menCount}/${womenCount}</span>
                    <span>Mannen/Vrouwen</span>
                </span>
                <span>
                    <span class="group-stats-value">${driversCount}</span>
                    <span>Rijbewijs</span>
                </span>
                <span>
                    <span class="group-stats-value">${groupMembers.length > 0 ? avgGroupScore : '-'}</span>
                    <span>Gem. Score</span>
                </span>
            `;

            // Group list (sortable)
            const list = document.createElement('div');
            list.className = 'group-list sortable';
            list.dataset.group = groupName;

            groupMembers.forEach(person => {
                list.appendChild(this.createPersonCard(person));
            });

            groupCard.appendChild(header);
            groupCard.appendChild(stats);
            groupCard.appendChild(list);
            groupsContainer.appendChild(groupCard);

            // Initialize sortable on this group list
            this.initSortable(list);
        });
    },

    // Create a person card element
    createPersonCard(person) {
        const card = document.createElement('div');
        card.className = `person-card ${person.getScoreClass()}`;
        card.dataset.name = person.naam;

        card.innerHTML = `
            <h3>${person.naam}</h3>
            <div class="score ${person.getScoreLevel()}">
                ${person.score > 0 ? person.score.toFixed(0) : '—'}${person.score > 0 ? '%' : ''}
            </div>
            <div class="person-info">
                <strong>Geslacht:</strong> ${person.gender === 'M' ? 'Man' : person.gender === 'V' ? 'Vrouw' : 'Onbekend'}<br>
                <strong>Rijbewijs:</strong> ${person.hasDriversLicense ? 'Ja' : 'Nee'}<br>
                <strong>Voorkeur 1:</strong> ${person.preferences.tak1}<br>
                <strong>Voorkeur 2:</strong> ${person.preferences.tak2}<br>
                <strong>Voorkeur 3:</strong> ${person.preferences.tak3}<br>
                <strong>Graag met:</strong> ${person.priorities.metWie && person.priorities.metWie.length > 0 ? person.priorities.metWie.join(', ') : 'Geen voorkeur'}<br>
                <strong>Niet met:</strong> ${person.priorities.nietMet && person.priorities.nietMet.length > 0 ? person.priorities.nietMet.join(', ') : 'Geen voorkeur'}<br>
                <strong>Prioriteit:</strong> ${person.priorities.prioriteit > 5 ? '👥 Medeleiding' : '📍 Tak'}
            </div>
        `;

        return card;
    },

    // Initialize SortableJS on a list
    initSortable(element) {
        // Destroy existing sortable instance if it exists
        if (element.sortableInstance) {
            element.sortableInstance.destroy();
        }

        element.sortableInstance = new Sortable(element, {
            group: 'people',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                this.handleDragEnd(evt);
            },
        });
    },

    // Handle drag and drop completion
    handleDragEnd(evt) {
        const personName = evt.item.dataset.name;
        const person = this.people.find(p => p.naam === personName);
        if (!person) return;

        // Determine new group assignment
        const newGroup = evt.to.dataset.group || null;
        
        if (person.assignedGroup !== newGroup) {
            person.assignedGroup = newGroup;
            this.updateScores();
            this.render();
        }
    },

    // Update scores for all people
    updateScores() {
        this.people.forEach(person => {
            person.score = person.calculateScore(this.people);
        });
    },

    // Export current state to Excel file
    exportToExcel() {
        if (this.people.length === 0) {
            this.showStatus('Geen gegevens om te exporteren', 'error');
            return;
        }

        const unassigned = this.people.filter(p => !p.assignedGroup);
        if (unassigned.length > 0) {
            this.showStatus(`Kan niet exporteren: ${unassigned.length} persoon/personen niet toegewezen`, 'error');
            return;
        }

        const exportData = this.people.map(person => ({
            Naam: person.naam,
            Geslacht: person.gender === 'M' ? 'Man' : person.gender === 'V' ? 'Vrouw' : '',
            Rijbewijs: person.hasDriversLicense ? 'Ja' : 'Nee',
            'Assigned Group': person.assignedGroup || 'Ongeassignerd',
            Score: person.score.toFixed(1),
            Tak1: person.preferences.tak1,
            Tak2: person.preferences.tak2,
            Tak3: person.preferences.tak3,
            'Met wie': person.priorities.metWie ? person.priorities.metWie.join(', ') : '',
            'Niet met': person.priorities.nietMet ? person.priorities.nietMet.join(', ') : '',
            Prioriteit: person.priorities.prioriteit || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Groepsleiding');

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const fileName = `Groepsleiding_${new Date().toISOString().slice(0, 10)}.xlsx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showStatus('✓ Export naar Excel geslaagd', 'success');
    },

    // Export current state to PDF file
    exportToPDF() {
        if (this.people.length === 0) {
            this.showStatus('Geen gegevens om te exporteren', 'error');
            return;
        }

        const unassigned = this.people.filter(p => !p.assignedGroup);
        if (unassigned.length > 0) {
            this.showStatus(`Kan niet exporteren: ${unassigned.length} persoon/personen niet toegewezen`, 'error');
            return;
        }

        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            this.showStatus('PDF-bibliotheek niet geladen (jsPDF)', 'error');
            return;
        }

        this.updateScores();

        const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const title = 'Groepsleiding export';
        let cursorY = 14;
        doc.setFontSize(16);
        doc.text(title, 14, cursorY);
        cursorY += 10;

        const sortedGroups = Array.from(this.groups).sort();

        const rowHeight = 6;
        const initialMarginX = 14;
const colWidths = [60, 20, 20, 50, 50, 50];

            sortedGroups.forEach((groupName, index) => {
                if (cursorY > pageHeight - 30) {
                    doc.addPage();
                    cursorY = 14;
                }

                const groupMembers = this.people
                    .filter(p => p.assignedGroup === groupName)
                    .sort((a, b) => a.naam.localeCompare(b.naam));

                const avgGroupScore = groupMembers.length > 0
                    ? (groupMembers.reduce((sum, p) => sum + p.score, 0) / groupMembers.length).toFixed(1)
                    : '0.0';

                const menCount = groupMembers.filter(p => p.gender === 'M').length;
                const womenCount = groupMembers.filter(p => p.gender === 'V').length;
                const driversCount = groupMembers.filter(p => p.hasDriversLicense).length;

                doc.setFontSize(12);
                doc.text(`Tak: ${groupName} (Gem. score: ${avgGroupScore}, ${menCount}M ${womenCount}V, ${driversCount} rijbewijs)`, initialMarginX, cursorY);
                cursorY += rowHeight;

                // Table header
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                const headers = ['Naam', 'Geslacht', 'Rijbewijs', 'Score', 'Tak1', 'Tak2'];
            let x = initialMarginX;
            headers.forEach((header, i) => {
                doc.text(header, x, cursorY);
                x += colWidths[i];
            });
            doc.setFont('helvetica', 'normal');
            cursorY += rowHeight;

            if (groupMembers.length === 0) {
                doc.text('Geen leden toegewezen', initialMarginX, cursorY);
                cursorY += rowHeight;
            } else {
                groupMembers.forEach(person => {
                    if (cursorY > pageHeight - 20) {
                        doc.addPage();
                        cursorY = 14;
                    }

                    x = initialMarginX;
                    const values = [
                        person.naam,
                        person.gender === 'M' ? 'Man' : person.gender === 'V' ? 'Vrouw' : '-',
                        person.hasDriversLicense ? 'Ja' : 'Nee',
                        person.score.toFixed(1),
                        person.preferences.tak1,
                        person.preferences.tak2
                    ];

                    values.forEach((value, i) => {
                        doc.text(String(value || '-'), x, cursorY);
                        x += colWidths[i];
                    });

                    cursorY += rowHeight;
                });
            }

            cursorY += 5;
        });

        doc.save(`Groepsleiding_${new Date().toISOString().slice(0, 10)}.pdf`);
        this.showStatus('✓ Export naar PDF geslaagd', 'success');
    },

    // Check and display conflicts
    checkConflicts() {
        const conflictsList = document.getElementById('conflictsList');
        conflictsList.innerHTML = '';
        const conflicts = [];

        this.people.forEach(person => {
            if (!person.assignedGroup) return;

            const groupMembers = this.people.filter(
                p => p.assignedGroup === person.assignedGroup && p.naam !== person.naam
            );

            // Check "niet met" conflicts
            if (person.priorities.nietMet && person.priorities.nietMet.length > 0) {
                groupMembers.forEach(member => {
                    const isConflict = person.priorities.nietMet.some(name => 
                        member.naam.toLowerCase().includes(name.toLowerCase()) || 
                        name.toLowerCase().includes(member.naam.toLowerCase())
                    );

                    if (isConflict) {
                        conflicts.push({
                            person: person.naam,
                            conflictWith: member.naam,
                            group: person.assignedGroup
                        });
                    }
                });
            }
        });

        // Display conflicts
        if (conflicts.length > 0) {
            document.getElementById('conflictsSection').style.display = 'block';
            conflicts.forEach(conflict => {
                const item = document.createElement('div');
                item.className = 'conflict-item';
                item.innerHTML = `
                    <strong>${conflict.person}</strong> en <strong>${conflict.conflictWith}</strong> 
                    zijn samen in <strong>${conflict.group}</strong>
                `;
                conflictsList.appendChild(item);
            });
        } else {
            document.getElementById('conflictsSection').style.display = 'none';
        }
    },

    // Show status message
    showStatus(message, type) {
        const statusEl = document.getElementById('uploadStatus');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
    },

    // Clear all data
    clear() {
        this.people = [];
        this.groups = new Set();
        this.allAssignments = [];
        
        document.getElementById('mainArea').style.display = 'none';
        document.getElementById('statsSection').style.display = 'none';
        document.getElementById('conflictsSection').style.display = 'none';
        document.getElementById('uploadStatus').className = 'status-message';
        document.getElementById('fileInput').value = '';
        
        this.showStatus('', '');
    }
};

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.querySelector('.upload-box');
    const clearBtn = document.getElementById('clearBtn');

    // Check if required libraries are loaded
    const checkLibraries = () => {
        if (typeof XLSX === 'undefined' || typeof Sortable === 'undefined') {
            setTimeout(checkLibraries, 100); // Retry after 100ms
        }
    };
    checkLibraries();

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            app.loadExcelFile(e.target.files[0]);
        }
    });

    // Drag and drop on upload area
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary)';
        uploadBox.style.background = 'var(--bg-light)';
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--border)';
        uploadBox.style.background = 'white';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--border)';
        uploadBox.style.background = 'white';

        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                app.loadExcelFile(file);
            } else {
                app.showStatus('Gelieve een Excel bestand (.xlsx/.xls) in te dienen', 'error');
            }
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        if (confirm('Weet je zeker dat je alles wilt wissen?')) {
            app.clear();
        }
    });

    // Export buttons
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    exportExcelBtn.addEventListener('click', () => {
        app.exportToExcel();
    });

    exportPdfBtn.addEventListener('click', () => {
        app.exportToPDF();
    });
});
