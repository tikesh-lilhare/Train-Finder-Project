const API_BASE_URL = 'http://localhost:8080';

document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const source = document.getElementById('source').value.trim();
    const destination = document.getElementById('destination').value.trim();
    
    if (!source || !destination) {
        showError('Please enter both source and destination cities');
        return;
    }
    
    await searchTrains(source, destination);
});

async function searchTrains(source, destination) {
    showLoading(true);
    hideError();
    hideResults();
    
    try {
        const url = `${API_BASE_URL}/search/by-name?sourceName=${encodeURIComponent(source)}&destinationName=${encodeURIComponent(destination)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayResults(data, source, destination);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Unable to connect to the server. Please make sure the API is running on localhost:8080');
        } else {
            showError('An error occurred while searching for trains. Please try again.');
        }
    } finally {
        showLoading(false);
    }
}

function displayResults(data, source, destination) {
    const resultsContent = document.getElementById('resultsContent');
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
        resultsContent.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🚫</div>
                <h3>No trains found</h3>
                <p>Sorry, no trains are available from ${source} to ${destination}.</p>
                <p>Please try different cities or check your spelling.</p>
            </div>
        `;
    } else {
        // Handle both single object and array responses
        const trains = Array.isArray(data) ? data : [data];
        
        resultsContent.innerHTML = trains.map(train => {
            const duration = calculateDuration(train.departureTime, train.arrivalTime);
            
            return `
                <div class="result-card">
                    <div class="train-header">
                        <div class="train-info">
                            <div class="train-name">${train.train.trainName}</div>
                            <div class="train-number">Train No: ${train.train.trainNumber}</div>
                        </div>
                    </div>
                    <div class="journey-details">
                        <div class="station">
                            <div class="station-name">${train.source.stationName}</div>
                            <div class="station-code">${train.source.stationCode}</div>
                            <div class="time">${formatTime(train.departureTime)}</div>
                        </div>
                        <div class="journey-line">
                            <div class="journey-duration">${duration}</div>
                            <div class="line"></div>
                        </div>
                        <div class="station">
                            <div class="station-name">${train.destination.stationName}</div>
                            <div class="station-code">${train.destination.stationCode}</div>
                            <div class="time">${formatTime(train.arrivalTime)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    showResults(true);
}

function calculateDuration(departureTime, arrivalTime) {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    let totalMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    
    // Handle next day arrival
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showResults(show) {
    document.getElementById('results').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function hideResults() {
    document.getElementById('results').style.display = 'none';
}

// Add some sample functionality for demo
document.getElementById('source').addEventListener('focus', function() {
    if (!this.value) {
        this.placeholder = 'e.g., Mumbai, Delhi, Bangalore';
    }
});

document.getElementById('destination').addEventListener('focus', function() {
    if (!this.value) {
        this.placeholder = 'e.g., Nagpur, Chennai, Kolkata';
    }
});