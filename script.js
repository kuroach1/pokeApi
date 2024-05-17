let currentTeam = [];
let teamHistory = [];
const maxTeamSize = 3;

// Obtiene referencias a elementos HTML por su ID
const pokemonInput = document.getElementById('pokemon-input');
const teamContainer = document.getElementById('team-container');
const historyContainer = document.getElementById('history-container');

// Objeto que mapea tipos de Pokémon a colores
const typeColors = {
    electric: '#FFEA70',
    normal: '#B09398',
    fire: '#FF675C',
    water: '#0596C7',
    ice: '#AFEAFD',
    rock: '#999799',
    flying: '#7AE7C7',
    grass: '#4A9681',
    psychic: '#FFC6D9',
    ghost: '#561D25',
    bug: '#A2FAA3',
    poison: '#795663',
    ground: '#D2B074',
    dragon: '#DA627D',
    steel: '#1D8A99',
    fighting: '#2F2F2F',
    default: '#2A1A1F',
};

// Esta función busca un Pokémon cuando se envía el formulario de búsqueda.
// Utiliza la PokeAPI para obtener información sobre el Pokémon.
const searchPokemon = event => {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
    let inputValue = event.target.pokemon.value.toLowerCase();
    // Utiliza la PokeAPI para buscar información del Pokémon por su nombre o número
    fetch(`https://pokeapi.co/api/v2/pokemon/${inputValue}`)
        .then(data => data.json())
        .then(response => renderPokemonData(response)) // Llama a la función para renderizar la información del Pokémon
        .catch(err => {
            // Si no se encuentra el Pokémon por nombre o número, intenta buscarlo por especie
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${inputValue}`)
                .then(data => data.json())
                .then(response => {
                    const pokemonId = response.id;
                    // Una vez que se encuentra la especie, busca el Pokémon por su ID
                    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
                        .then(data => data.json())
                        .then(response => renderPokemonData(response)) // Llama a la función para renderizar la información del Pokémon
                        .catch(err => renderNotFound(inputValue)); // Si no se encuentra, muestra un mensaje de error
                })
                .catch(err => renderNotFound(inputValue)); // Si no se encuentra, muestra un mensaje de error
        });
}

// Esta función renderiza la información del Pokémon obtenida de la API en la interfaz de usuario.
const renderPokemonData = data => {
    // Extrae la información necesaria del objeto de respuesta
    const sprite = data.sprites.front_default;
    const { stats, types } = data;
    // Renderiza el nombre, imagen, tipos y estadísticas del Pokémon en la interfaz de usuario
    pokeName.textContent = data.name;
    pokeImg.setAttribute('src', sprite);
    pokeId.textContent = `Nº ${data.id}`;
    setCardColor(types); // Llama a la función para establecer el color del fondo de la tarjeta según los tipos del Pokémon
    renderPokemonTypes(types); // Llama a la función para renderizar los tipos del Pokémon
    renderPokemonStats(stats); // Llama a la función para renderizar las estadísticas del Pokémon
}

// Esta función establece el color de fondo de la tarjeta del Pokémon según su tipo.
const setCardColor = types => {
    const colorOne = typeColors[types[0].type.name];
    const colorTwo = types[1] ? typeColors[types[1].type.name] : typeColors.default;
    pokeImg.style.background = `radial-gradient(${colorTwo} 33%, ${colorOne} 33%)`;
    pokeImg.style.backgroundSize = ' 5px 5px';
}

// Esta función renderiza los tipos del Pokémon en la interfaz de usuario.
const renderPokemonTypes = types => {
    pokeTypes.innerHTML = '';
    types.forEach(type => {
        const typeTextElement = document.createElement("div");
        typeTextElement.style.color = typeColors[type.type.name];
        typeTextElement.textContent = type.type.name;
        pokeTypes.appendChild(typeTextElement);
    });
}

// Esta función renderiza las estadísticas del Pokémon en la interfaz de usuario.
const renderPokemonStats = stats => {
    pokeStats.innerHTML = '';
    stats.forEach(stat => {
        const statElement = document.createElement("div");
        const statElementName = document.createElement("div");
        const statElementAmount = document.createElement("div");
        statElementName.textContent = stat.stat.name;
        statElementAmount.textContent = stat.base_stat;
        statElement.appendChild(statElementName);
        statElement.appendChild(statElementAmount);
        pokeStats.appendChild(statElement);
    });
}

// Esta función agrega un Pokémon al equipo actual.
const addPokemonToTeam = () => {
    // Verifica si el equipo actual está lleno
    if (currentTeam.length < maxTeamSize) {
        const input = pokemonInput.value.toLowerCase();
        const pokemonName = isNaN(input) ? input : Number(input);
        // Comprueba si el Pokémon ya está en el equipo actual
        if (currentTeam.some(pokemon => pokemon.name.toLowerCase() === pokemonName || pokemon.id === pokemonName)) {
            alert(`¡${pokemonName} ya está en tu equipo!`);
            return;
        }
        // Utiliza la PokeAPI para obtener información sobre el Pokémon y luego lo agrega al equipo
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
            .then(data => data.json())
            .then(response => {
                currentTeam.push(response); // Agrega el Pokémon al equipo actual
                updateTeamDisplay(); // Actualiza la visualización del equipo en la interfaz de usuario
                if (currentTeam.length === maxTeamSize) {
                    pokemonInput.disabled = true;
                    document.querySelector('form button').disabled = true;
                    // Agrega el equipo actual al historial solo cuando se agregan los tres Pokémon
                    teamHistory.push([...currentTeam]);

                     // Muestra un mensaje llamativo de equipo completado
                     const teamMessage = document.getElementById('team-message');
                     teamMessage.textContent = '¡Equipo completado! Listo para la batalla.';
                     teamMessage.classList.add('team-completed'); // Añade una clase para estilos adicionales
                     teamMessage.classList.add('has-content');
                }
                pokemonInput.value = ''; // Limpia el input después de agregar un Pokémon
                pokemonInput.focus();
            })
            .catch(err => {
                renderNotFound(pokemonName); // Si no se encuentra el Pokémon, muestra un mensaje de error
            })
    }
}

// Esta función muestra un mensaje de error cuando no se encuentra un Pokémon.
const renderNotFound = (pokemonName) => {
    alert(`${pokemonName} no encontrado. Por favor, asegúrate de ingresar un nombre o número de Pokémon válido.`);
    pokeName.textContent = `${pokemonName} no encontrado`;
    pokeImg.setAttribute('src', 'poke-shadow.png');
    pokeImg.style.background = '#fff';
    pokeTypes.innerHTML = '';
    pokeStats.innerHTML = '';
    pokeId.textContent = '';
}

// Esta función actualiza la visualización del equipo en la interfaz de usuario.
const updateTeamDisplay = () => {
    teamContainer.innerHTML = '';
    currentTeam.forEach(pokemon => {
        const pokeCardClone = document.createElement('div');
        pokeCardClone.classList.add('poke-card');
        const sprite = pokemon.sprites.front_default;
        const { stats, types } = pokemon;
        // Renderiza la tarjeta del Pokémon con su información
        pokeCardClone.innerHTML = `
            <div data-poke-name>${pokemon.name}</div>
            <div data-poke-img-container class="img-container">
                <img data-poke-img class="poke-img" src="${sprite}" />
            </div>
            <div data-poke-id>Nº ${pokemon.id}</div>
            <div data-poke-types class="poke-types">${types.map(type => `<div style="color:${typeColors[type.type.name]}">${type.type.name}</div>`).join('')}</div>
            <div data-poke-stats class="poke-stats">${stats.map(stat => `<div><div>${stat.stat.name}</div><div>${stat.base_stat}</div></div>`).join('')}</div>
        `;
        teamContainer.appendChild(pokeCardClone); // Agrega la tarjeta del Pokémon al contenedor del equipo
    });
}

// Esta función reinicia el equipo actual.
const resetTeam = () => {
    currentTeam = [];
    pokemonInput.disabled = false;
    document.querySelector('form button').disabled = false;
    document.getElementById('team-message').textContent = ''; 
    document.getElementById('team-message').classList.remove('has-content'); 
    document.getElementById('history-container').classList.remove('show');
    pokemonInput.value = '';
    teamContainer.innerHTML = '';
    pokemonInput.focus();
}

// Esta función muestra el historial de equipos en la interfaz de usuario.
const showTeamHistory = () => {
    historyContainer.innerHTML = ''; // Limpia el contenedor del historial antes de agregar la tabla

    if (teamHistory.length === 0) {
        // Si no hay historial, muestra un mensaje indicando que no hay historial de equipos.
        const noHistoryMessage = document.createElement('p');
        noHistoryMessage.textContent = 'No hay historial de equipos.';
        historyContainer.appendChild(noHistoryMessage);
        return;
    }

    const historyTable = document.createElement('table');
    historyTable.classList.add('history-table');

    // Crea la fila de encabezado de la tabla
    const headerRow = historyTable.insertRow();
    const teamHeader = document.createElement('th');
    teamHeader.textContent = 'Equipo';
    headerRow.appendChild(teamHeader);

    const pokemonHeader = document.createElement('th');
    pokemonHeader.textContent = 'Pokemones';
    headerRow.appendChild(pokemonHeader);

    // Itera a través del historial de equipos y muestra cada equipo en la tabla
    teamHistory.forEach((team, index) => {
        const row = historyTable.insertRow();
        const teamCell = row.insertCell();
        teamCell.textContent = `Equipo ${index + 1}`;

        const pokemonCell = row.insertCell();
        pokemonCell.classList.add('pokemon-column');

        // Muestra cada Pokémon en el equipo actual con su imagen, nombre, tipos y ID
        team.forEach(pokemon => {
            const pokemonInfo = document.createElement('div');
            pokemonInfo.classList.add('pokemon-info');

            const pokemonName = document.createElement('span');
            pokemonName.textContent = pokemon.name;

            const pokemonImage = document.createElement('img');
            pokemonImage.src = pokemon.sprites.front_default;
            pokemonImage.alt = pokemon.name;

            const pokemonAttributes = document.createElement('div');
            pokemonAttributes.textContent = `Tipo: ${pokemon.types.map(type => type.type.name).join(', ')} - ID: ${pokemon.id}`;

            pokemonInfo.appendChild(pokemonImage);
            pokemonInfo.appendChild(pokemonName);
            pokemonInfo.appendChild(pokemonAttributes);
            pokemonCell.appendChild(pokemonInfo);
        });
    });

    historyContainer.appendChild(historyTable); // Agrega la tabla al contenedor del historial
}
