const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.add('hidden'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.remove('hidden');
  });
});