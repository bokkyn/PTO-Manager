function isLoggedIn() {
  console.log("cookirrr");
  return document.cookie.split(";").some((cookie) => cookie == "loggedIn=true");
}
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = document.getElementById("email").value;
    console.log(email);
    let password = document.getElementById("password").value;
    let passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&()])[A-Za-z\d!@#$%&()]{8,}$/; //mora sadržavati od a-z, A-Z, brojeve i znak neki iz uglatih zagrada i minimalo 8 znakova

    if (email.indexOf("@") == -1 || email.indexOf(".") == -1) {
      //-1 vrati kad uopće ne postoji u stringu
      alert("Greška, email ne sadrži @ ili .");
      //
    } else if (
      email.indexOf("@") > email.lastIndexOf(".") ||
      Math.abs(email.indexOf("@") - email.lastIndexOf(".") == 1)
    ) {
      alert("Greška, nepostojeća domena"); //želimo da je domena oblika nesto@nesto.nesto tj da sadrzi @ i . i da je . iza @
    } else if (
      email.indexOf("@") == 0 ||
      email.lastIndexOf(".") == 0 ||
      email.lastIndexOf("@") == 0 ||
      email.indexOf(".") == 0
    ) {
      alert("Greška, mail ne može početi niti završiti sa . ili @"); //ti znakovi ne smiju biti na rvom ili zadnjem mjestu
    } else if (!passwordRegex.test(password)) {
      //gore se provjerava sa ifovima ovdje s regexo
      alert(
        "Greška, lozinka treba sadržavati 1 veliko slovo, 1 malo slovo, nešto od ovih znakova: !@#$%&(), broj i najmanje 8 znamenki"
      );
    } else {
      document.cookie = "loggedIn=true"; //ako je sve dobro spremamo podatke u kolacic
      document.cookie = `email=${email}`;
      document.cookie = `password=${password}`;

      if (isLoggedIn()) {
        window.location.href = "pto.html"; //šaljemo na PTO
      } else {
        console.log("error");
      }
    }
  });
});

//funkcija za uklanjanje divova dok nema ništa u njima, prima ime diva i naslov poviše kojeg skriva
function hideEmptyDiv(divName, titleName) {
  let div = document.getElementById(divName);
  let title = document.getElementById(titleName);
  if (div.innerHTML.trim() === "") {
    div.style.display = "none";
    title.style.display = "none";
  } else {
    div.style.display = "flex";
    title.style.display = "flex";
  }
}

const daysTag = document.querySelector(".days"), //dohvacanje dana u kalendaru
  currentDate = document.querySelector(".current-date"),
  prevNextIcon = document.querySelectorAll(".icons span");

let date = new Date(),
  currYear = date.getFullYear(), //dohvacanje trenutne godine i mjeseca
  currMonth = date.getMonth();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://jsonplaceholder.typicode.com/users") //odavde fetchamo zaposlenike
    .then((response) => response.json())
    .then((data) => {
      const userTemplate = document.getElementById("user-template");
      const userContainer = document.getElementById("user-container");

      data.forEach((user) => {
        //za svakog korisnika pravimo novi koji sadrži podatke i tipku za dodavanje pto-a
        const userClone = document.importNode(userTemplate.content, true);
        userClone.getElementById("user-name").textContent = user.name;
        userClone.getElementById("user-username").textContent = user.username;
        userClone.getElementById("user-mail").textContent = user.email;
        userClone.getElementById("user-phone").textContent = user.phone;
        userClone
          .querySelector(".pto-button")
          .addEventListener("click", function () {
            document.querySelector(".overlay").style.display = "block";
            console.log(getSelectedDates(user.name)); //kad se klinkne poziva funkciju za biranje datuma
          });
        userContainer.appendChild(userClone);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

//funkcija za spremanje u storage, kako se divovi nebi izgubili kad refreshamo
function saveToLocalStorage(data) {
  localStorage.setItem("ptoData", JSON.stringify(data));
}

// loadanje iz storagea
function loadFromLocalStorage() {
  const data = localStorage.getItem("ptoData");
  return data ? JSON.parse(data) : [];
}

function createDivElement(dateObj) {
  const parentDivEnded = document.getElementById("pto-div-class-ended");
  const parentDivOngoing = document.getElementById("pto-div-class-ongoing");
  const parentDivUpcoming = document.getElementById("pto-div-class-upcoming");
  //funkcija za stvaranje diva s odabranim pto, ko argument prima dateobj
  const existingDiv = document.querySelector(
    `.date-info[data-person="${dateObj.personName}"]`
  );
  if (
    existingDiv &&
    existingDiv.querySelector(".start-date") &&
    existingDiv.querySelector(".end-date")
  ) {
    //ako već postoji ništa, ovo nam treba da ne stvara duple ponovno za svaki objekt
    return;
  } else {
    //inače. stvaraj novi a svim potrebnim atributima i tipkom za brisanje
    const div = document.createElement("div");
    div.classList.add("date-info");
    div.setAttribute("data-person", dateObj.personName);
    const today = new Date();
    div.innerHTML = `
      <p>Name: ${dateObj.personName}</p>
      <p class="start-date">Start Date: ${dateObj.startDate}</p>
      <p class="end-date">End Date: ${dateObj.endDate}</p>
      <p>Number of Days: ${dateObj.numDays}</p>
      <p>Season: ${dateToSeason(dateObj.startDate)}</p>
      <p>Status: ${dateObj.status}</p>
      <div>
        <img src="${seasonPhoto(dateToSeason(dateObj.startDate))}">
      </div>
      <button class="delete-button">Delete</button>
    `;
    div.querySelector(".delete-button").addEventListener("click", function () {
      div.style.display = "none";
      location.reload(); //ne skriva div ako nema ništa u njemu dok ne reloda, tako da relodamo svakim brisanjem
      removeFromLocalStorage(dateObj.personName);
    });
    if (dateObj.status === "Ended") {
      parentDivEnded.appendChild(div);
    }
    if (dateObj.status === "Ongoing") {
      parentDivOngoing.appendChild(div);
    }
    if (dateObj.status === "Upcoming") {
      parentDivUpcoming.appendChild(div);
    }

    saveToLocalStorage([...loadFromLocalStorage(), dateObj]);

    hideEmptyDiv("pto-div-class-ended", "ended-text");
    hideEmptyDiv("pto-div-class-ongoing", "ongoing-text");
    hideEmptyDiv("pto-div-class-upcoming", "upcoming-text");
  }
}

function removeFromLocalStorage(personName) {
  //funkcija za uklanjanje iz storagea, treba nam kad brišemo
  const data = loadFromLocalStorage().filter(
    (item) => item.personName !== personName
  );
  saveToLocalStorage(data);
}

hideEmptyDiv("pto-div-class-ended", "ended-text");
hideEmptyDiv("pto-div-class-ongoing", "ongoing-text");
hideEmptyDiv("pto-div-class-upcoming", "upcoming-text");

window.addEventListener("load", function () {
  //loadanje iz storagea svaki put kad refreshamo
  const existingData = loadFromLocalStorage();
  existingData.forEach(createDivElement);
});

function dateToSeason(dateString) {
  //date smo pravili da bude dd/mm/yyyy i sad to rastavljamo i uspoređujemo da vidimo koje je godišnje doba
  const dateParts = dateString.split("/").map((part) => parseInt(part, 10));
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];
  if (
    (month === 12 && day >= 21) ||
    month === 1 ||
    month === 2 ||
    (month === 3 && day < 20)
  ) {
    return "Winter";
  } else if (
    (month === 3 && day >= 20) ||
    month === 4 ||
    month === 5 ||
    (month === 6 && day < 21)
  ) {
    return "Spring";
  } else if (
    (month === 6 && day >= 21) ||
    month === 7 ||
    month === 8 ||
    (month === 9 && day < 22)
  ) {
    return "Summer";
  } else if (
    (month === 9 && day >= 22) ||
    month === 10 ||
    month === 11 ||
    (month === 12 && day < 21)
  ) {
    return "Autumn";
  }
}

function seasonPhoto(seasonName) {
  // ovisno o godišnjem dobu stavi sliku
  switch (seasonName.toLowerCase()) {
    case "winter":
      return "./images/winter.jpg"; //relativni url
    case "spring":
      return "https://cdn.britannica.com/05/155405-050-F8969EE6/Spring-flowers-fruit-trees-bloom.jpg"; //apsolutni
    case "summer":
      return "./images/summer.jpg";
    case "autumn":
      return "https://cdn.britannica.com/88/137188-050-8C779D64/Boston-Public-Garden.jpg";
  }
}

function getSelectedDates(personName) {
  let today = new Date(); //današnji datum, potreban da se odredi status (ongoing, ended...)
  let selectedDates = [];
  let dateObj = {
    startDate: null,
    endDate: null,
    numDays: null,
    personName: null,
    status: null,
  };
  function handleDayClick(personName) {
    return function (event) {
      // ako je kliknuto na li element pamtimo datum
      if (event.target.tagName === "LI") {
        let clickedDay = new Date(
          currYear,
          currMonth,
          parseInt(event.target.textContent)
        );
        //pushamo ih na listu
        if (selectedDates.length < 2) {
          selectedDates.push(clickedDay);

          //kad imamo 2 u listi računamo njihovu razliku i stvaramo objekt do kraja
          if (selectedDates.length === 2) {
            let timeDiff = Math.abs(
              selectedDates[0].getTime() - selectedDates[1].getTime()
            );
            let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; //dodajemo jer je glupa ako je jedan dan pto da piše 0
            dateObj.numDays = diffDays;
            dateObj.personName = personName; //spremamo imena i formatiramo datume
            dateObj.startDate = formatDate(selectedDates[0]);
            dateObj.endDate = formatDate(selectedDates[1]);

            if (selectedDates[0] > today) {
              //status pto-a
              dateObj.status = "Upcoming";
            } else if (selectedDates[0] < today && selectedDates[1] > today) {
              dateObj.status = "Ongoing";
            } else {
              dateObj.status = "Ended";
            }

            if (selectedDates[1] < selectedDates[0]) {
              //ne može pto završit prije nego je počeo, promjenimo ih
              alert("Vjerojatno ste mislili obrnuto");
              dateObj.startDate = formatDate(selectedDates[1]);
              dateObj.endDate = formatDate(selectedDates[0]);
              console.log("danas" + today);
              if (selectedDates[1] > today) {
                dateObj.status = "Upcoming";
              }
              if (selectedDates[1] < today && selectedDates[0] > today) {
                dateObj.status = "Ongoing";
              } else {
                dateObj.status = "Ended";
              }
            }

            createDivElement(dateObj); //stvara se element
            document.querySelector(".overlay").style.display = "none"; //gasi se overlay koji je sadržavao kalendar za biranje
            selectedDates = []; //čistimo niz
          }
        }
      }
    };
  }

  document
    .querySelector(".days")
    .addEventListener("click", handleDayClick(personName));

  function formatDate(date) {
    let d = new Date(date),
      month = "" + (d.getMonth() + 1), //datum razdvojimo na dan, mjesec, godinu
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("/"); //i joinamo ih sa /
  }

  return dateObj;
}
//pogleda coding nepal dynamic calendar
const renderCalendar = () => {
  //stvaranje custom kalendara
  let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
  let liTag = "";

  for (let i = firstDayofMonth; i > 0; i--) {
    liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
  }

  for (let i = 1; i <= lastDateofMonth; i++) {
    let isToday =
      i === date.getDate() &&
      currMonth === new Date().getMonth() &&
      currYear === new Date().getFullYear()
        ? "active"
        : "";
    liTag += `<li class="${isToday}">${i}</li>`;
  }

  for (let i = lastDayofMonth; i < 6; i++) {
    liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
  }
  currentDate.innerText = `${months[currMonth]} ${currYear} - click 2 days to add PTO!`; //godina mjesec i tip
  daysTag.innerHTML = liTag;
};

renderCalendar(); //poziv funkcije

prevNextIcon.forEach((icon) => {
  icon.addEventListener("click", () => {
    currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

    if (currMonth < 0 || currMonth > 11) {
      date = new Date(currYear, currMonth, new Date().getDate());
      currYear = date.getFullYear(); // nova godina
      currMonth = date.getMonth(); // updatanje trenutnog mjeseca
    } else {
      date = new Date();
    }
    renderCalendar();
  });
});

function isLoggedIn() {
  //je logiran
  return document.cookie.split(";").some((cookie) => cookie == "loggedIn=true");
}

if (!isLoggedIn()) {
  signOut();
}

const logout = document.querySelector(".logout-link"); //dohvaćanje logouta

logout.addEventListener("click", () => {
  //klik na logout zove signout
  signOut();
});

function signOut() {
  //čisti local storage i postavlja expire u prošlost
  localStorage.clear();
  document.cookie = "loggedIn=; expires=Sat, 01 Jan 2000 00:00:00 GMT; path=/";
  document.cookie = "email=; expires=Sat, 01 Jan 2000 00:00:00 GMT; path=/";
  document.cookie = "password=; expires=Sat, 01 Jan 2000 00:00:00 GMT; path=/";
  //vraća na početnu stranicu
  window.location.href = "./index.html";
}
