document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const {
        value
    } = document.querySelector('#email');
    const header = document.querySelector('h1')
    if (value.includes('@')) {
        header.textContent = 'Looks Good';
    } else {
        header.textContent = 'Invalid Email';
    }
})