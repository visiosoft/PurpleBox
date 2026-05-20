function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.toggle('open');
}

function toggleAcc(btn) {
    var body = btn.nextElementSibling;
    if (!body) return;
    var isOpen = body.classList.contains('open');
    document.querySelectorAll('.accordion-body.open').forEach(function (b) {
        b.classList.remove('open');
        if (b.previousElementSibling) b.previousElementSibling.classList.remove('open');
    });
    if (!isOpen) {
        body.classList.add('open');
        btn.classList.add('open');
    }
}
