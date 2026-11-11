const searchInput = document.getElementById("notification-search");

const noticeItems = document.querySelectorAll(".notice-list li");

searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase().trim();

    noticeItems.forEach(function (notice) {

        const notificationText = notice.textContent.toLowerCase();

        if (notificationText.includes(searchText)) {
            notice.hidden = false;
        } else {
            notice.hidden = true;
        }

    });

});