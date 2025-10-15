// Money Tracker - Add Entry JavaScript

// Hourly rates for each job
const HOURLY_RATES = {
    barback: 8.00,
    serving: 2.13,
    juicing: 12.00
};

// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('entry-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Prevent future dates
    
    // Add custom adjustment button handler
    document.getElementById('add-adjustment-btn').addEventListener('click', addCustomAdjustment);
    
    // Format pay period input
    const payPeriodInput = document.getElementById('pay-period');
    payPeriodInput.addEventListener('input', formatPayPeriod);
});

// Counter for custom adjustments
let customAdjustmentCount = 0;

// Add custom adjustment fields
function addCustomAdjustment() {
    customAdjustmentCount++;
    const container = document.getElementById('custom-adjustments-container');
    
    const adjustmentDiv = document.createElement('div');
    adjustmentDiv.className = 'custom-adjustment';
    adjustmentDiv.id = `custom-adjustment-${customAdjustmentCount}`;
    adjustmentDiv.innerHTML = `
        <hr style="border-color: #2aa5a5; margin: 15px 0;">
        <label for="custom-adjustment-label-${customAdjustmentCount}">Custom Adjustment Label:</label>
        <input type="text" id="custom-adjustment-label-${customAdjustmentCount}" name="customAdjustmentLabel" placeholder="e.g., Uniform">
        
        <label for="custom-adjustment-${customAdjustmentCount}">Amount:</label>
        <input type="number" id="custom-adjustment-${customAdjustmentCount}" name="customAdjustment" step="0.01" min="0" placeholder="0.00">
        
        <button type="button" class="remove-adjustment-btn" onclick="removeCustomAdjustment(${customAdjustmentCount})">Remove</button>
    `;
    
    container.appendChild(adjustmentDiv);
}

// Remove custom adjustment
function removeCustomAdjustment(id) {
    const element = document.getElementById(`custom-adjustment-${id}`);
    if (element) {
        element.remove();
    }
}

// Format pay period as MM/DD-MM/DD
function formatPayPeriod(e) {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric
    
    if (value.length >= 4) {
        // Format as MM/DD-MM/DD
        let formatted = value.substring(0, 2);
        if (value.length >= 2) formatted += '/' + value.substring(2, 4);
        if (value.length >= 4) formatted += '-' + value.substring(4, 6);
        if (value.length >= 6) formatted += '/' + value.substring(6, 8);
        
        e.target.value = formatted;
    }
}

// Job type change handler
document.getElementById('job-type').addEventListener('change', function() {
    const jobType = this.value;
    
    // Hide all options first
    document.getElementById('time-place-section').style.display = 'none';
    document.getElementById('info-tracking-section').style.display = 'none';
    
    const allJobOptions = document.querySelectorAll('.job-options');
    const allJobInfo = document.querySelectorAll('.job-info');
    
    allJobOptions.forEach(option => option.style.display = 'none');
    allJobInfo.forEach(info => info.style.display = 'none');
    
    if (jobType) {
        // Show appropriate sections
        if (jobType === 'barback') {
            document.getElementById('time-place-section').style.display = 'block';
            document.getElementById('barback-options').style.display = 'block';
            document.getElementById('info-tracking-section').style.display = 'block';
            document.getElementById('barback-info').style.display = 'block';
        } else if (jobType === 'serving') {
            document.getElementById('time-place-section').style.display = 'block';
            document.getElementById('serving-options').style.display = 'block';
            document.getElementById('info-tracking-section').style.display = 'block';
            document.getElementById('serving-info').style.display = 'block';
        } else if (jobType === 'juicing') {
            // Juicing has no time/place options, just hours
            document.getElementById('info-tracking-section').style.display = 'block';
            document.getElementById('juicing-info').style.display = 'block';
        } else if (jobType === 'paycheck') {
            document.getElementById('time-place-section').style.display = 'block';
            document.getElementById('paycheck-options').style.display = 'block';
            document.getElementById('info-tracking-section').style.display = 'block';
            document.getElementById('paycheck-info').style.display = 'block';
        }
    }
});

// Form submission handler
document.getElementById('entry-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const jobType = document.getElementById('job-type').value;
    const date = document.getElementById('entry-date').value;
    
    let entryData = {
        id: Date.now(), // Unique ID based on timestamp
        date: date,
        jobType: jobType,
        timestamp: new Date().toISOString()
    };
    
    // Collect data based on job type
    if (jobType === 'barback') {
        entryData.shift = document.getElementById('barback-shift').value;
        entryData.tips = parseFloat(document.getElementById('barback-tips').value) || 0;
        entryData.hours = parseFloat(document.getElementById('barback-hours').value) || 0;
        entryData.hourlyRate = HOURLY_RATES.barback;
        
        // Calculate base pay and total pay
        entryData.basePay = entryData.hours * entryData.hourlyRate;
        entryData.totalPay = entryData.basePay + entryData.tips;
        entryData.effectiveHourlyRate = entryData.hours > 0 ? entryData.totalPay / entryData.hours : 0;
    } else if (jobType === 'serving') {
        entryData.location = document.getElementById('serving-location').value;
        entryData.tips = parseFloat(document.getElementById('serving-tips').value) || 0;
        entryData.tipsClaimed = parseFloat(document.getElementById('serving-claimed').value) || 0;
        entryData.hours = parseFloat(document.getElementById('serving-hours').value) || 0;
        entryData.hourlyRate = HOURLY_RATES.serving;
        
        // Calculate base pay and total pay
        entryData.basePay = entryData.hours * entryData.hourlyRate;
        entryData.totalPay = entryData.basePay + entryData.tips;
        entryData.effectiveHourlyRate = entryData.hours > 0 ? entryData.totalPay / entryData.hours : 0;
    } else if (jobType === 'juicing') {
        entryData.hours = parseFloat(document.getElementById('juicing-hours').value) || 0;
        entryData.hourlyRate = HOURLY_RATES.juicing;
        
        // Calculate total pay (no tips for juicing)
        entryData.totalPay = entryData.hours * entryData.hourlyRate;
        entryData.effectiveHourlyRate = entryData.hourlyRate;
    } else if (jobType === 'paycheck') {
        entryData.payPeriod = document.getElementById('pay-period').value;
        entryData.payDate = document.getElementById('pay-date').value;
        entryData.grossBarback = parseFloat(document.getElementById('gross-barback').value) || 0;
        entryData.grossBarbackHours = parseFloat(document.getElementById('gross-barback-hours').value) || 0;
        entryData.grossServing = parseFloat(document.getElementById('gross-serving').value) || 0;
        entryData.grossServingHours = parseFloat(document.getElementById('gross-serving-hours').value) || 0;
        entryData.grossJuicing = parseFloat(document.getElementById('gross-juicing').value) || 0;
        entryData.grossJuicingHours = parseFloat(document.getElementById('gross-juicing-hours').value) || 0;
        entryData.grossTips = parseFloat(document.getElementById('gross-tips').value) || 0;
        entryData.houseAccount = parseFloat(document.getElementById('house-account').value) || 0;
        entryData.parking = parseFloat(document.getElementById('parking').value) || 0;
        entryData.tipsDed = parseFloat(document.getElementById('tips-ded').value) || 0;
        entryData.netPay = parseFloat(document.getElementById('net-pay').value) || 0;
        
        // Collect custom adjustments
        entryData.customAdjustments = [];
        const customAdjustmentDivs = document.querySelectorAll('.custom-adjustment');
        customAdjustmentDivs.forEach(div => {
            const labelInput = div.querySelector('input[name="customAdjustmentLabel"]');
            const amountInput = div.querySelector('input[name="customAdjustment"]');
            if (labelInput && amountInput && labelInput.value) {
                entryData.customAdjustments.push({
                    label: labelInput.value,
                    amount: parseFloat(amountInput.value) || 0
                });
            }
        });
        
        // Calculate total hours
        entryData.totalHours = entryData.grossBarbackHours + entryData.grossServingHours + 
                               entryData.grossJuicingHours;
        
        // Calculate total gross
        entryData.totalGross = entryData.grossBarback + entryData.grossServing + 
                               entryData.grossJuicing + entryData.grossTips;
        
        // Calculate total adjustments
        entryData.totalAdjustments = entryData.houseAccount + entryData.parking + entryData.tipsDed;
        entryData.customAdjustments.forEach(adj => {
            entryData.totalAdjustments += adj.amount;
        });
    }
    
    // Save to localStorage
    saveEntry(entryData);
    
    // Show success message
    const successMsg = document.getElementById('success-message');
    successMsg.style.display = 'block';
    
    // Reset form
    document.getElementById('entry-form').reset();
    document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('time-place-section').style.display = 'none';
    document.getElementById('info-tracking-section').style.display = 'none';
    
    // Clear custom adjustments
    document.getElementById('custom-adjustments-container').innerHTML = '';
    customAdjustmentCount = 0;
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
});

// Save entry to localStorage
function saveEntry(entryData) {
    let entries = JSON.parse(localStorage.getItem('moneyTrackerEntries')) || [];
    entries.push(entryData);
    localStorage.setItem('moneyTrackerEntries', JSON.stringify(entries));
}
