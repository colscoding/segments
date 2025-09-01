
document.addEventListener('DOMContentLoaded', () => {
    const segmentsContainer = document.getElementById('segments-container');
    const applyButton = document.getElementById('apply-filters');




    let allSegments = [];

    // Pace string "M:SS" to seconds
    const paceToSeconds = (pace) => {
        if (!pace || typeof pace !== 'string') return Infinity;
        const parts = pace.split(':');
        if (parts.length !== 2) return Infinity;
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const renderSegments = (segments) => {
        segmentsContainer.innerHTML = '';
        segments.filter(Boolean).forEach(segment => {
            const segmentElement = document.createElement('div');
            segmentElement.classList.add('col-md-4', 'mb-4');

            const card = document.createElement('div');
            card.classList.add('card', 'h-100');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const nameElement = document.createElement('h5');
            nameElement.classList.add('card-title');
            const nameLink = document.createElement('a');
            nameLink.href = `https://www.strava.com/segments/${segment.id}`;
            nameLink.target = '_blank';
            nameLink.textContent = segment.name;
            nameElement.appendChild(nameLink);
            cardBody.appendChild(nameElement);

            const idElement = document.createElement('p');
            idElement.classList.add('card-text');
            const idLink = document.createElement('a');
            idLink.href = `https://www.strava.com/segments/${segment.id}`;
            idLink.target = '_blank';
            idLink.textContent = `ID: ${segment.id}`;
            idElement.appendChild(idLink);
            cardBody.appendChild(idElement);

            const distanceElement = document.createElement('p');
            distanceElement.classList.add('card-text');
            const distanceInKm = (parseFloat(segment.distance) / 1000).toFixed(2);
            distanceElement.textContent = `Distance: ${distanceInKm} km`;
            cardBody.appendChild(distanceElement);

            const attemptsElement = document.createElement('p');
            attemptsElement.classList.add('card-text');
            attemptsElement.textContent = `Attempts: ${segment.attempts.attempts} by ${segment.attempts.people} people`;
            cardBody.appendChild(attemptsElement);

            const leaderboardTitle = document.createElement('h6');
            leaderboardTitle.classList.add('card-subtitle', 'mb-2', 'text-muted');
            leaderboardTitle.textContent = 'Leaderboard';
            cardBody.appendChild(leaderboardTitle);

            const leaderboardElement = document.createElement('ul');
            leaderboardElement.classList.add('list-group', 'list-group-flush');

            segment.leaderboard.forEach(entry => {
                const leaderboardItem = document.createElement('li');
                leaderboardItem.classList.add('list-group-item');
                leaderboardItem.textContent = `${entry.position}. ${entry.time} (${entry.pace}/km)`;
                leaderboardElement.appendChild(leaderboardItem);
            });

            cardBody.appendChild(leaderboardElement);
            card.appendChild(cardBody);
            segmentElement.appendChild(card);

            segmentsContainer.appendChild(segmentElement);
        });
    };

    const applyFiltersAndSorting = () => {
        let filteredSegments = [...allSegments];

        // Filter values
        const minDistance = parseFloat(document.getElementById('min-distance').value) || 0;
        const maxDistance = parseFloat(document.getElementById('max-distance').value) || Infinity;
        const minAttempts = parseInt(document.getElementById('min-attempts').value, 10) || 0;
        const maxAttempts = parseInt(document.getElementById('max-attempts').value, 10) || Infinity;
        const minPeople = parseInt(document.getElementById('min-people').value, 10) || 0;
        const maxPeople = parseInt(document.getElementById('max-people').value, 10) || Infinity;
        const minFirstPace = parseFloat(document.getElementById('min-leaderboard-first').value) || 0;
        const maxFirstPace = parseFloat(document.getElementById('max-leaderboard-first').value) || Infinity;
        const minLastPace = parseFloat(document.getElementById('min-leaderboard-last').value) || 0;
        const maxLastPace = parseFloat(document.getElementById('max-leaderboard-last').value) || Infinity;

        filteredSegments = filteredSegments.filter(segment => {
            const distanceInKm = parseFloat(segment.distance) / 1000;
            const firstPace = paceToSeconds(segment.leaderboard[0]?.pace);
            const lastPace = paceToSeconds(segment.leaderboard[segment.leaderboard.length - 1]?.pace);

            return distanceInKm >= minDistance &&
                distanceInKm <= maxDistance &&
                segment.attempts.attempts >= minAttempts &&
                segment.attempts.attempts <= maxAttempts &&
                segment.attempts.people >= minPeople &&
                segment.attempts.people <= maxPeople &&
                firstPace >= minFirstPace &&
                firstPace <= maxFirstPace &&
                lastPace >= minLastPace &&
                lastPace <= maxLastPace;
        });

        // Sort values
        const sortBy = document.getElementById('sort-by').value;
        const sortOrder = document.getElementById('sort-order').value;

        filteredSegments.sort((a, b) => {
            let valA, valB;

            switch (sortBy) {
                case 'distance':
                    valA = parseFloat(a.distance);
                    valB = parseFloat(b.distance);
                    break;
                case 'attempts':
                    valA = a.attempts.attempts;
                    valB = b.attempts.attempts;
                    break;
                case 'people':
                    valA = a.attempts.people;
                    valB = b.attempts.people;
                    break;
                case 'leaderboard-speed':
                    valA = paceToSeconds(a.leaderboard[0]?.pace);
                    valB = paceToSeconds(b.leaderboard[0]?.pace);
                    break;
                case 'name':
                default:
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
            }

            if (valA < valB) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });

        renderSegments(filteredSegments);
    };

    const localSegments = getSegmentsFromLocalFile()
    allSegments = localSegments.filter(Boolean)
        .filter(x => x?.attempts && Array.isArray(x?.leaderboard));
    renderSegments(allSegments);
    applyButton.addEventListener('click', applyFiltersAndSorting);
});
