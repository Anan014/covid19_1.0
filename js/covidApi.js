async function getData() {
    if (!localStorage.getItem("tempStorage")) {
        let data1 = await (await fetch('https://corona-api.com/countries')).json();
        let data2 = await (await fetch('https://cors-anywhere.herokuapp.com/https://restcountries.herokuapp.com/api/v1', { mode: 'cors' })).json();
        localStorage.setItem("tempStorage", JSON.stringify({ data1: data1, data2: data2 }));
    }
}
let data = JSON.parse(localStorage.getItem("tempStorage"));

getData();
console.log(data);

const confirmed_total = document.querySelector("#confirmed-total");
const recovered_total = document.querySelector("#recovered-total");
const deaths_total = document.querySelector("#deaths-total");
// const critical_total = document.querySelector("#critical-total");

let global_confirmed = 0;
let global_recovered = 0;
let global_deaths = 0;
let global_critical = 0;



// loop to count global data

// loop to count global confirmed
data.data1.data.forEach((dataElement, index) => {
    global_confirmed += dataElement.latest_data.confirmed;
    global_critical += dataElement.latest_data.critical;
    global_deaths += dataElement.latest_data.deaths;
    global_recovered += dataElement.latest_data.recovered;
});

console.log(global_confirmed);
console.log(global_critical);
console.log(global_deaths);
console.log(global_recovered);

confirmed_total.innerHTML = global_confirmed;
recovered_total.innerHTML = global_recovered;
deaths_total.innerHTML = global_deaths;