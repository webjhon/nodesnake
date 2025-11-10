const FOREST_BASE64 = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2NCcgaGVpZ2',
    'h0PSc2NCc+CjxyZWN0IHdpZHRoPSc2NCcgaGVpZ2h0PSc2NCcgZmlsbD0nIzFhYmM5YycvPgo8cmVjdCB5PSc4JyB3aWR0aD0nNj',
    'QnIGhlaWdodD0nMTInIGZpbGw9JyM0OGM5YjAnLz4KPHJlY3QgeT0nMjQnIHdpZHRoPSc2NCcgaGVpZ2h0PSc4JyBmaWxsPScjMT',
    'ZhMDg1Jy8+CjxyZWN0IHk9JzM2JyB3aWR0aD0nNjQnIGhlaWdodD0nOCcgZmlsbD0nIzQ4YzliMCcvPgo8cmVjdCB5PSc0OCcgd2',
    'lkdGg9JzY0JyBoZWlnaHQ9JzEyJyBmaWxsPScjMTE3YTY1Jy8+CjxyZWN0IHg9JzIwJyB5PScxOCcgd2lkdGg9JzgnIGhlaWdodD',
    '0nOCcgZmlsbD0nIzBiNTM0NScvPgo8cmVjdCB4PSczNicgeT0nMzQnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9JyMwZTY2NT',
    'UnLz4KPC9zdmc+',
].join('');

const EMBER_BASE64 = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2NCcgaGVpZ2',
    'h0PSc2NCc+CjxyZWN0IHdpZHRoPSc2NCcgaGVpZ2h0PSc2NCcgZmlsbD0nIzkyMmIyMScvPgo8cGF0aCBkPSdNMCAxMmg2NCcgc3',
    'Ryb2tlPScjYzAzOTJiJyBzdHJva2Utd2lkdGg9JzgnLz4KPHBhdGggZD0nTTAgMzJoNjQnIHN0cm9rZT0nI2U3NGMzYycgc3Ryb2',
    'tlLXdpZHRoPSc4Jy8+CjxwYXRoIGQ9J00wIDUyaDY0JyBzdHJva2U9JyNmZjZmNjEnIHN0cm9rZS13aWR0aD0nOCcvPgo8cmVjdC',
    'B4PScxNCcgeT0nMTQnIHdpZHRoPScxMicgaGVpZ2h0PScxMicgZmlsbD0nIzY0MWUxNicvPgo8cmVjdCB4PSczOCcgeT0nMzgnIH',
    'dpZHRoPScxMicgaGVpZ2h0PScxMicgZmlsbD0nIzY0MWUxNicvPgo8L3N2Zz4=',
].join('');

const MIDNIGHT_BASE64 = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2NCcgaGVpZ2',
    'h0PSc2NCc+CjxyZWN0IHdpZHRoPSc2NCcgaGVpZ2h0PSc2NCcgZmlsbD0nIzFiMjYzMScvPgo8cGF0aCBkPSdNMCAwbDY0IDY0Jy',
    'BzdHJva2U9JyMyZTQwNTMnIHN0cm9rZS13aWR0aD0nMTAnIG9wYWNpdHk9JzAuOCcvPgo8cGF0aCBkPSdNNjQgMEwwIDY0JyBzdH',
    'Jva2U9JyM1ZGFkZTInIHN0cm9rZS13aWR0aD0nNicgb3BhY2l0eT0nMC43NScvPgo8Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPS',
    'c4JyBmaWxsPScjZjRkMDNmJy8+CjxjaXJjbGUgY3g9JzQ0JyBjeT0nNDQnIHI9JzYnIGZpbGw9JyM4NWMxZTknIG9wYWNpdHk9Jz',
    'AuOScvPgo8L3N2Zz4=',
].join('');

const PLAYER_SKINS = [
    {
        id: 'forest-glow',
        name: 'Brilho da Floresta',
        preview: FOREST_BASE64,
        base64Image: FOREST_BASE64,
    },
    {
        id: 'ember-strike',
        name: 'Golpe de Brasa',
        preview: EMBER_BASE64,
        base64Image: EMBER_BASE64,
    },
    {
        id: 'midnight-crossing',
        name: 'Cruzeiro da Meia-Noite',
        preview: MIDNIGHT_BASE64,
        base64Image: MIDNIGHT_BASE64,
    },
];

export default PLAYER_SKINS;
