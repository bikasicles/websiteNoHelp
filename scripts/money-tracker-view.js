// Money Tracker - View Stats JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadRecentEntries();
    
    // Add entries filter handler
    document.getElementById('entries-filter').addEventListener('change', function() {
        loadRecentEntries();
    });
});

// Calculate button handler
document.getElementById('calculate-btn').addEventListener('click', function() {
    const viewType = document.getElementById('view-type').value;
    const averageType = document.getElementById('average-type').value;
    
    calculateStats(viewType, averageType);
});

// Load and display recent entries
function loadRecentEntries() {
    let entries = JSON.parse(localStorage.getItem('moneyTrackerEntries')) || [];
    const entriesList = document.getElementById('entries-list');
    const filter = document.getElementById('entries-filter').value;
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p style="color: #ffffff;">No entries yet. Add your first entry!</p>';
        return;
    }
    
    // Filter entries by job type if not "all"
    if (filter !== 'all') {
        entries = entries.filter(entry => entry.jobType === filter);
    }
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p style="color: #ffffff;">No entries found for this filter.</p>';
        return;
    }
    
    // Sort by date (most recent first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    entriesList.innerHTML = '';
    
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        
        let detailsHTML = `
            <h4>${entry.jobType.charAt(0).toUpperCase() + entry.jobType.slice(1)} - ${entry.date}</h4>
        `;
        
        if (entry.jobType === 'barback') {
            detailsHTML += `
                <p>Shift: ${entry.shift.toUpperCase()}</p>
                <p>Hours: ${entry.hours.toFixed(2)} @ $${entry.hourlyRate ? entry.hourlyRate.toFixed(2) : '8.00'}/hr</p>
                <p>Base Pay: $${entry.basePay ? entry.basePay.toFixed(2) : '0.00'}</p>
                <p>Tips: $${entry.tips.toFixed(2)}</p>
                <p><strong>Total Pay: $${entry.totalPay ? entry.totalPay.toFixed(2) : entry.tips.toFixed(2)}</strong></p>
                <p>Effective Rate: $${entry.effectiveHourlyRate ? entry.effectiveHourlyRate.toFixed(2) : '0.00'}/hr</p>
            `;
        } else if (entry.jobType === 'serving') {
            detailsHTML += `
                <p>Location: ${entry.location}</p>
                <p>Hours: ${entry.hours.toFixed(2)} @ $${entry.hourlyRate ? entry.hourlyRate.toFixed(2) : '2.13'}/hr</p>
                <p>Base Pay: $${entry.basePay ? entry.basePay.toFixed(2) : '0.00'}</p>
                <p>Tips: $${entry.tips.toFixed(2)}</p>
                <p>Tips Claimed: $${entry.tipsClaimed.toFixed(2)}</p>
                <p><strong>Total Pay: $${entry.totalPay ? entry.totalPay.toFixed(2) : entry.tips.toFixed(2)}</strong></p>
                <p>Effective Rate: $${entry.effectiveHourlyRate ? entry.effectiveHourlyRate.toFixed(2) : '0.00'}/hr</p>
            `;
        } else if (entry.jobType === 'juicing') {
            detailsHTML += `
                <p>Hours: ${entry.hours.toFixed(2)} @ $${entry.hourlyRate ? entry.hourlyRate.toFixed(2) : '12.00'}/hr</p>
                <p><strong>Total Pay: $${entry.totalPay ? entry.totalPay.toFixed(2) : '0.00'}</strong></p>
            `;
        } else if (entry.jobType === 'paycheck') {
            detailsHTML += `
                <p>Pay Period: ${entry.payPeriod}</p>
                <p>Total Gross: $${entry.totalGross.toFixed(2)}</p>
                <p>Total Hours: ${entry.totalHours ? entry.totalHours.toFixed(2) : '0.00'}</p>
                <p>Total Adjustments: -$${entry.totalAdjustments.toFixed(2)}</p>
                <p>Net Pay: $${entry.netPay.toFixed(2)}</p>
            `;
        }
        
        detailsHTML += `<button onclick="deleteEntry(${entry.id})">Delete</button>`;
        
        entryDiv.innerHTML = detailsHTML;
        entriesList.appendChild(entryDiv);
    });
}

// Delete single entry
function deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        let entries = JSON.parse(localStorage.getItem('moneyTrackerEntries')) || [];
        entries = entries.filter(entry => entry.id !== entryId);
        localStorage.setItem('moneyTrackerEntries', JSON.stringify(entries));
        loadRecentEntries();
        // Recalculate stats if they were showing
        const viewType = document.getElementById('view-type').value;
        const averageType = document.getElementById('average-type').value;
        calculateStats(viewType, averageType);
    }
}

// Delete all data
document.getElementById('delete-all-btn').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete ALL entries? This cannot be undone!')) {
        if (confirm('Really delete everything? Last chance!')) {
            localStorage.removeItem('moneyTrackerEntries');
            loadRecentEntries();
            document.getElementById('averages-content').innerHTML = '<p>No data available</p>';
            document.getElementById('monthly-content').innerHTML = '<p>No data available</p>';
            document.getElementById('estimates-content').innerHTML = '<p>No data available</p>';
        }
    }
});

// Calculate statistics
function calculateStats(viewType, averageType) {
    let entries = JSON.parse(localStorage.getItem('moneyTrackerEntries')) || [];
    
    if (entries.length === 0) {
        document.getElementById('averages-content').innerHTML = '<p>No data to calculate</p>';
        document.getElementById('monthly-content').innerHTML = '<p>No data to calculate</p>';
        document.getElementById('estimates-content').innerHTML = '<p>No data to calculate</p>';
        return;
    }
    
    // Filter by job type
    if (viewType === 'all') {
        // "All" means all job shifts (exclude paychecks to avoid double-counting)
        entries = entries.filter(entry => entry.jobType !== 'paycheck');
    } else {
        // Specific job type
        entries = entries.filter(entry => entry.jobType === viewType);
    }
    
    if (entries.length === 0) {
        document.getElementById('averages-content').innerHTML = '<p>No entries for this job type</p>';
        return;
    }
    
    // Calculate based on average type
    if (averageType === 'shift') {
        calculatePerShiftAverage(entries, viewType);
    } else if (averageType === 'week') {
        calculatePerWeekAverage(entries, viewType);
    } else if (averageType === 'month') {
        calculatePerMonthAverage(entries, viewType);
    }
    
    // Calculate monthly summary and estimates
    calculateMonthlySummary(entries, viewType);
    calculateEstimates(entries, viewType);
}

// Calculate per shift average
function calculatePerShiftAverage(entries, viewType) {
    let totalTips = 0;
    let totalHours = 0;
    let totalPay = 0;
    let totalNetPay = 0;
    let count = entries.length;
    
    entries.forEach(entry => {
        // For job shifts (barback, serving, juicing)
        if (entry.tips) totalTips += entry.tips;
        if (entry.hours) totalHours += entry.hours;
        if (entry.totalPay) totalPay += entry.totalPay;
        
        // For paychecks
        if (entry.jobType === 'paycheck') {
            if (entry.grossTips) totalTips += entry.grossTips;
            if (entry.totalHours) totalHours += entry.totalHours;
            if (entry.netPay) totalNetPay += entry.netPay;
        }
    });
    
    const avgTips = count > 0 ? (totalTips / count).toFixed(2) : 0;
    const avgHours = count > 0 ? (totalHours / count).toFixed(2) : 0;
    const avgPay = count > 0 ? (totalPay / count).toFixed(2) : 0;
    
    let html = `
        <p><strong>Total Entries:</strong> ${count}</p>
        <p><strong>Total Hours:</strong> ${totalHours.toFixed(2)}</p>
        <p><strong>Total Tips:</strong> $${totalTips.toFixed(2)}</p>
        <p><strong>Total Pay:</strong> $${totalPay.toFixed(2)}</p>
        <p><strong>Average Pay per Entry:</strong> $${avgPay}</p>
        <p><strong>Average Hours per Entry:</strong> ${avgHours}</p>
    `;
    
    if (totalHours > 0) {
        const avgHourlyRate = (totalPay / totalHours).toFixed(2);
        html += `<p><strong>Average Effective Hourly Rate:</strong> $${avgHourlyRate}/hr</p>`;
    }
    
    if (viewType === 'paycheck' && totalNetPay > 0) {
        const avgNetPay = (totalNetPay / count).toFixed(2);
        html += `<p><strong>Average Net Pay:</strong> $${avgNetPay}</p>`;
    }
    
    document.getElementById('averages-content').innerHTML = html;
}

// Calculate per week average
function calculatePerWeekAverage(entries, viewType) {
    // Group entries by week
    const weeklyData = {};
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const weekStart = getWeekStart(date);
        
        if (!weeklyData[weekStart]) {
            weeklyData[weekStart] = { tips: 0, hours: 0, totalPay: 0, count: 0, netPay: 0 };
        }
        
        // For job shifts
        if (entry.tips) weeklyData[weekStart].tips += entry.tips;
        if (entry.hours) weeklyData[weekStart].hours += entry.hours;
        if (entry.totalPay) weeklyData[weekStart].totalPay += entry.totalPay;
        
        // For paychecks
        if (entry.jobType === 'paycheck') {
            if (entry.grossTips) weeklyData[weekStart].tips += entry.grossTips;
            if (entry.totalHours) weeklyData[weekStart].hours += entry.totalHours;
            if (entry.netPay) weeklyData[weekStart].netPay += entry.netPay;
        }
        
        weeklyData[weekStart].count++;
    });
    
    const weeks = Object.keys(weeklyData);
    const totalWeeks = weeks.length;
    
    let totalWeeklyTips = 0;
    let totalWeeklyHours = 0;
    let totalWeeklyPay = 0;
    let totalWeeklyNetPay = 0;
    
    weeks.forEach(week => {
        totalWeeklyTips += weeklyData[week].tips;
        totalWeeklyHours += weeklyData[week].hours;
        totalWeeklyPay += weeklyData[week].totalPay;
        totalWeeklyNetPay += weeklyData[week].netPay;
    });
    
    const avgWeeklyPay = (totalWeeklyPay / totalWeeks).toFixed(2);
    const avgWeeklyTips = (totalWeeklyTips / totalWeeks).toFixed(2);
    const avgWeeklyHours = (totalWeeklyHours / totalWeeks).toFixed(2);
    
    let html = `
        <p><strong>Total Weeks:</strong> ${totalWeeks}</p>
        <p><strong>Total Hours:</strong> ${totalWeeklyHours.toFixed(2)}</p>
        <p><strong>Total Tips:</strong> $${totalWeeklyTips.toFixed(2)}</p>
        <p><strong>Total Pay:</strong> $${totalWeeklyPay.toFixed(2)}</p>
        <p><strong>Average Pay per Week:</strong> $${avgWeeklyPay}</p>
        <p><strong>Average Hours per Week:</strong> ${avgWeeklyHours}</p>
    `;
    
    if (totalWeeklyHours > 0) {
        const avgHourlyRate = (totalWeeklyPay / totalWeeklyHours).toFixed(2);
        html += `<p><strong>Average Effective Hourly Rate:</strong> $${avgHourlyRate}/hr</p>`;
    }
    
    if (viewType === 'paycheck' && totalWeeklyNetPay > 0) {
        const avgWeeklyNetPay = (totalWeeklyNetPay / totalWeeks).toFixed(2);
        html += `<p><strong>Average Net Pay per Week:</strong> $${avgWeeklyNetPay}</p>`;
    }
    
    document.getElementById('averages-content').innerHTML = html;
}

// Calculate per month average
function calculatePerMonthAverage(entries, viewType) {
    // Group entries by month
    const monthlyData = {};
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { tips: 0, hours: 0, totalPay: 0, count: 0, netPay: 0 };
        }
        
        // For job shifts
        if (entry.tips) monthlyData[monthKey].tips += entry.tips;
        if (entry.hours) monthlyData[monthKey].hours += entry.hours;
        if (entry.totalPay) monthlyData[monthKey].totalPay += entry.totalPay;
        
        // For paychecks
        if (entry.jobType === 'paycheck') {
            if (entry.grossTips) monthlyData[monthKey].tips += entry.grossTips;
            if (entry.totalHours) monthlyData[monthKey].hours += entry.totalHours;
        }
        
        if (entry.netPay) monthlyData[monthKey].netPay += entry.netPay;
        monthlyData[monthKey].count++;
    });
    
    const months = Object.keys(monthlyData);
    const totalMonths = months.length;
    
    let totalMonthlyTips = 0;
    let totalMonthlyHours = 0;
    let totalMonthlyPay = 0;
    let totalMonthlyNetPay = 0;
    
    months.forEach(month => {
        totalMonthlyTips += monthlyData[month].tips;
        totalMonthlyHours += monthlyData[month].hours;
        totalMonthlyPay += monthlyData[month].totalPay;
        totalMonthlyNetPay += monthlyData[month].netPay;
    });
    
    const avgMonthlyTips = (totalMonthlyTips / totalMonths).toFixed(2);
    const avgMonthlyHours = (totalMonthlyHours / totalMonths).toFixed(2);
    const avgMonthlyPay = (totalMonthlyPay / totalMonths).toFixed(2);
    
    let html = `
        <p><strong>Total Months:</strong> ${totalMonths}</p>
        <p><strong>Total Hours:</strong> ${totalMonthlyHours.toFixed(2)}</p>
        <p><strong>Total Tips:</strong> $${totalMonthlyTips.toFixed(2)}</p>
        <p><strong>Total Pay:</strong> $${totalMonthlyPay.toFixed(2)}</p>
        <p><strong>Average Pay per Month:</strong> $${avgMonthlyPay}</p>
        <p><strong>Average Hours per Month:</strong> ${avgMonthlyHours}</p>
    `;
    
    if (totalMonthlyHours > 0) {
        const avgHourlyRate = (totalMonthlyPay / totalMonthlyHours).toFixed(2);
        html += `<p><strong>Average Effective Hourly Rate:</strong> $${avgHourlyRate}/hr</p>`;
    }
    
    if (viewType === 'paycheck' && avgMonthlyNetPay > 0) {
        html += `<p><strong>Average Net Pay per Month:</strong> $${totalMonthlyNetPay.toFixed(2)}</p>`;
    }
    
    document.getElementById('averages-content').innerHTML = html;
}

// Calculate monthly summary
function calculateMonthlySummary(entries, viewType) {
    const monthlyData = {};
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
                name: monthName, 
                tips: 0, 
                hours: 0,
                totalPay: 0,
                netPay: 0,
                totalEarnings: 0
            };
        }
        
        // For job shifts
        if (entry.tips) monthlyData[monthKey].tips += entry.tips;
        if (entry.hours) monthlyData[monthKey].hours += entry.hours;
        if (entry.totalPay) monthlyData[monthKey].totalPay += entry.totalPay;
        
        // For paychecks
        if (entry.jobType === 'paycheck') {
            if (entry.grossTips) monthlyData[monthKey].tips += entry.grossTips;
            if (entry.totalHours) monthlyData[monthKey].hours += entry.totalHours;
        }
        
        if (entry.netPay) monthlyData[monthKey].netPay += entry.netPay;
    });
    
    // Calculate total earnings
    Object.keys(monthlyData).forEach(month => {
        if (viewType === 'paycheck') {
            monthlyData[month].totalEarnings = monthlyData[month].tips + monthlyData[month].netPay;
        } else {
            // For job shifts, earnings = total pay (base + tips)
            monthlyData[month].totalEarnings = monthlyData[month].totalPay;
        }
    });
    
    // Sort by month (most recent first)
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    
    let html = '<h4>Past Months</h4>';
    
    sortedMonths.forEach(month => {
        const data = monthlyData[month];
        html += `
            <div style="border-left: 3px solid #2aa5a5; padding-left: 10px; margin: 10px 0;">
                <p><strong>${data.name}</strong></p>
        `;
        
        if (viewType === 'paycheck') {
            html += `
                <p>Total Earnings: $${data.totalEarnings.toFixed(2)}</p>
                <p>Net Pay: $${data.netPay.toFixed(2)} | Tips: $${data.tips.toFixed(2)} | Hours: ${data.hours.toFixed(2)}</p>
            `;
        } else {
            const avgRate = data.hours > 0 ? (data.totalPay / data.hours).toFixed(2) : '0.00';
            html += `
                <p>Total Pay: $${data.totalPay.toFixed(2)}</p>
                <p>Tips: $${data.tips.toFixed(2)} | Hours: ${data.hours.toFixed(2)}</p>
                <p>Avg Rate: $${avgRate}/hr</p>
            `;
        }
        
        html += `</div>`;
    });
    
    document.getElementById('monthly-content').innerHTML = html;
}

// Calculate estimates for future months
function calculateEstimates(entries, viewType) {
    if (entries.length === 0) {
        document.getElementById('estimates-content').innerHTML = '<p>Need more data for estimates</p>';
        return;
    }
    
    // Get current month data
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate average from all historical data
    let totalTips = 0;
    let totalHours = 0;
    let totalPay = 0;
    let totalNetPay = 0;
    
    entries.forEach(entry => {
        // For job shifts
        if (entry.tips) totalTips += entry.tips;
        if (entry.hours) totalHours += entry.hours;
        if (entry.totalPay) totalPay += entry.totalPay;
        
        // For paychecks
        if (entry.jobType === 'paycheck') {
            if (entry.grossTips) totalTips += entry.grossTips;
            if (entry.totalHours) totalHours += entry.totalHours;
        }
        
        if (entry.netPay) totalNetPay += entry.netPay;
    });
    
    // Get unique months for averaging
    const uniqueMonths = new Set();
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        uniqueMonths.add(monthKey);
    });
    
    const monthCount = uniqueMonths.size || 1;
    const avgMonthlyTips = (totalTips / monthCount).toFixed(2);
    const avgMonthlyHours = (totalHours / monthCount).toFixed(2);
    const avgMonthlyPay = (totalPay / monthCount).toFixed(2);
    
    let html = `
        <h4>Next Month Estimate</h4>
        <p><strong>${nextMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</strong></p>
    `;
    
    if (viewType === 'paycheck') {
        const avgMonthlyNetPay = (totalNetPay / monthCount).toFixed(2);
        html += `
            <p>Estimated Tips: $${avgMonthlyTips}</p>
            <p>Estimated Net Pay: $${avgMonthlyNetPay}</p>
            <p>Estimated Hours: ${avgMonthlyHours}</p>
            <p><strong>Total Estimated Earnings: $${(parseFloat(avgMonthlyTips) + parseFloat(avgMonthlyNetPay)).toFixed(2)}</strong></p>
        `;
    } else {
        const avgHourlyRate = avgMonthlyHours > 0 ? (totalPay / totalHours).toFixed(2) : '0.00';
        html += `
            <p>Estimated Pay: $${avgMonthlyPay}</p>
            <p>Estimated Tips: $${avgMonthlyTips}</p>
            <p>Estimated Hours: ${avgMonthlyHours}</p>
            <p>Avg Rate: $${avgHourlyRate}/hr</p>
        `;
    }
    
    html += `<p style="font-size: 0.9em; font-style: italic;">Based on ${monthCount} month(s) of data</p>`;
    
    document.getElementById('estimates-content').innerHTML = html;
}

// Helper function to get the start of the week (Monday)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
}
