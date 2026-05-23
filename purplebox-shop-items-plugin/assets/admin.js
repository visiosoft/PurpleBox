(function () {
    const list = document.getElementById('pbx-items-list');
    const addButton = document.getElementById('pbx-add-item');
    const template = document.getElementById('pbx-item-template');

    if (!list || !addButton || !template) {
        return;
    }

    function refreshNumbers() {
        const rows = list.querySelectorAll('.pbx-item-row');

        rows.forEach((row, index) => {
            const number = row.querySelector('.pbx-item-number');
            if (number) {
                number.textContent = String(index + 1);
            }
        });
    }

    function bindRemoveActions(root) {
        const removeButtons = root.querySelectorAll('.pbx-remove-item');

        removeButtons.forEach((button) => {
            button.addEventListener('click', function () {
                const row = this.closest('.pbx-item-row');
                if (row) {
                    row.remove();
                    refreshNumbers();
                }
            });
        });
    }

    addButton.addEventListener('click', function () {
        const index = list.querySelectorAll('.pbx-item-row').length;
        let html = template.innerHTML;

        html = html.replaceAll('__INDEX__', String(index));
        html = html.replace('__NUMBER__', String(index + 1));

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();

        const row = wrapper.firstElementChild;
        if (!row) {
            return;
        }

        list.appendChild(row);
        bindRemoveActions(row);
        refreshNumbers();
    });

    bindRemoveActions(document);
    refreshNumbers();
})();
