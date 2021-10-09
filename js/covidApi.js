const loader = document.querySelector(".loader");

async function getData() {
    if (!localStorage.getItem("tempStorage")) {
        loader.style.visibility = "visible";
        loader.style.opacity = "1";
        let data1 = await (await fetch('https://corona-api.com/countries')).json();
        // let data2 = await (await fetch('https://cors-anywhere.herokuapp.com/https://restcountries.herokuapp.com/api/v1', { mode: 'cors' })).json();
        let data2 = await (await fetch('https://raw.githubusercontent.com/Anan014/covid19_1.0/main/js/all_countries.json')).json();
        loader.style.visibility = "hidden";
        loader.style.opacity = "0";
        localStorage.setItem("tempStorage", JSON.stringify({ data1: data1, data2: data2 }));
    }
}
let data = JSON.parse(localStorage.getItem("tempStorage"));

//varibales
const confirmed_total = document.querySelector("#confirmed-total");
const recovered_total = document.querySelector("#recovered-total");
const deaths_total = document.querySelector("#deaths-total");
const critical_total = document.querySelector("#critical-total");
const country_select_span = document.querySelector("#country-select-toggle span");
const theList = document.querySelector(".theList");
const input = document.querySelector(".search_input");

let global_confirmed = 0;
let global_recovered = 0;
let global_deaths = 0;
let global_critical = 0;
let countries_covid_api = [];
let all_regions = [];
let regin_country_data = [];

let myChart;
let myChart1;

//arrays for selected country
let country_list_user = [];
let regions_country_list_user = [];
let country_list_confirmed = [];
let country_list_recovered = [];
let country_list_deaths = [];
let country_list_critical = [];

//obj for every country inclueds
//country name,country code
//latest confirmed,critical,deaths,recovered,
//todays confirmed,deaths
let country_covid_stats = {
    name: "",
    code: "",
    region: "",
    latest_data: {
        latest_confirmed: 0,
        latest_critical: 0,
        latest_deaths: 0,
        latest_recovered: 0
    },
    today: {
        today_confirmed: 0,
        today_deaths: 0
    }
}

//function to return unique regions
const unique = (value, index, self) => {
    return self.indexOf(value) === index
}



getData();
console.log(data);



//country select
document.querySelector('#country-select-toggle').onclick = () => {
    document.querySelector('#country-select-list').classList.toggle('active')

}





// loop to count throw data1 with covid cases
data.data1.data.forEach((dataElement, index) => {
    //calculate global
    global_confirmed += dataElement.latest_data.confirmed;
    global_critical += dataElement.latest_data.critical;
    global_deaths += dataElement.latest_data.deaths;
    global_recovered += dataElement.latest_data.recovered;

    //push objects for every country details to an array
    countries_covid_api.push({
        name: dataElement.name,
        code: dataElement.code,
        region: "",
        latest_data: {
            latest_confirmed: dataElement.latest_data.confirmed,
            latest_critical: dataElement.latest_data.critical,
            latest_deaths: dataElement.latest_data.deaths,
            latest_recovered: dataElement.latest_data.recovered
        },
        today: {
            today_confirmed: dataElement.today.confirmed,
            today_deaths: dataElement.today.deaths
        }
    });
    //end of push to an array
});


data.data2.forEach(data2Element => {
    all_regions.push(data2Element.region);

    countries_covid_api.forEach(countryElement => {
        if (countryElement.code == data2Element.cca2)
            countryElement.region = data2Element.region;
    });

});


//unique Regions array
const uniqueRegions = all_regions.filter(unique).filter(region => region != '');

//create array with regions and every region have country with status

let global_data = [];


uniqueRegions.forEach(regionName => {
    let tempRegionArr = [],
        tempRegionTotalConfirmed = 0,
        tempRegionTotalCritical = 0,
        tempRegionTotalDeaths = 0,
        tempRegionTotalRecovered = 0;

    countries_covid_api.forEach(country => {
        if (country.region == regionName) {
            tempRegionArr.push(country)
            tempRegionTotalConfirmed += country.latest_data.latest_confirmed;
            tempRegionTotalCritical += country.latest_data.latest_critical;
            tempRegionTotalDeaths += country.latest_data.latest_deaths;
            tempRegionTotalRecovered += country.latest_data.latest_recovered;
        }
    });
    global_data.push({
        regionName: regionName,
        regionTotalConfirmed: tempRegionTotalConfirmed,
        regionTotalCritical: tempRegionTotalCritical,
        regionTotalDeaths: tempRegionTotalDeaths,
        regionTotalRecoverd: tempRegionTotalRecovered,
        regionCountries: tempRegionArr
    });

});



//add global to the array
countries_covid_api.push({
    code: "GLOBAL",
    latest_data: {
        latest_confirmed: global_confirmed,
        latest_critical: global_critical,
        latest_deaths: global_deaths,
        latest_recovered: global_recovered
    },
    name: "Global"
});



console.log(global_confirmed);
console.log(global_critical);
console.log(global_deaths);
console.log(global_recovered);

console.log("countries_all_api");
console.log(countries_covid_api);
console.log("all_regions");
console.log(uniqueRegions);
console.log("global_data");
console.log(global_data);


confirmed_total.innerHTML = global_confirmed;
recovered_total.innerHTML = global_recovered;
deaths_total.innerHTML = global_deaths;


// update chart function

var ctx = document.getElementById('myChart').getContext('2d');
var ctx1 = document.getElementById('myChart1').getContext('2d');




theList.innerHTML += (`<li onclick="fetchData('GLOBAL')" id="global">Global</li>`)

global_data.forEach(country => {
    theList.innerHTML += (`<li onclick="fetchDataRegion('${country.regionName}')" id="${country.regionName}">${country.regionName}</li>`)
});
countries_covid_api.forEach(country => {
    theList.innerHTML += (`<li onclick="fetchData('${country.code}')" id="${country.name.replace(/ /g,"_")}">${country.name}</li>`)
});



//input event start when the input value changes
// input.addEventListener("input", function() {
//     let value = input.value.toUpperCase();
//     console.log(value);
//     countries_covid_api.forEach(country => {
//         if (country.name.toUpperCase().startsWith(value)) {
//             if (document.getElementById(country.name) != null)
//                 document.getElementById(country.name).classList.remove("hide");
//         } else {
//             if (document.getElementById(country.name) != null)
//                 document.getElementById(country.name).classList.add("hide");
//         }
//     })
// })

function fetchData(selected_country_code) {

    country_list_confirmed = [];
    country_list_recovered = [];
    country_list_deaths = [];
    country_list_critical = [];

    country_list_user = countries_covid_api.filter(country =>
        country.code == selected_country_code)[0];

    console.log("country_list_user");
    console.log(country_list_user);

    country_list_confirmed.push(country_list_user.latest_data.latest_confirmed);
    country_list_recovered.push(country_list_user.latest_data.latest_recovered);
    country_list_deaths.push(country_list_user.latest_data.latest_deaths);
    country_list_critical.push(country_list_user.latest_data.latest_critical);

    console.log("country_list_user", country_list_user);
    console.log("country_list_confirmed", country_list_confirmed);
    console.log("country_list_recovered", country_list_recovered);
    console.log("country_list_deaths", country_list_deaths);
    console.log("country_list_critical", country_list_critical);

    country_select_span.innerHTML = country_list_user.name;
    updateStatus();
}

function fetchDataRegion(selected_region_code) {
    //get the selected region object
    regions_country_list_user = global_data.filter(region =>
        region.regionName == selected_region_code)[0];

    console.log("regions_country_list_user", regions_country_list_user);

    country_select_span.innerHTML = selected_region_code;

    updateStatusRegion(regions_country_list_user);

}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function updateStatus() {
    confirmed_total.innerHTML = numberWithCommas(country_list_confirmed[0]);
    recovered_total.innerHTML = numberWithCommas(country_list_recovered[0]);
    deaths_total.innerHTML = numberWithCommas(country_list_deaths[0]);
    critical_total.innerHTML = numberWithCommas(country_list_critical[0]);
    axesLinearChartCountry(country_list_user);
}

function updateStatusRegion(obj) {
    console.log("obj", obj);
    console.log("obj.regionTotalRecoverd", obj.regionTotalRecoverd);
    confirmed_total.innerHTML = numberWithCommas(obj.regionTotalConfirmed);
    recovered_total.innerHTML = numberWithCommas(obj.regionTotalRecoverd);
    deaths_total.innerHTML = numberWithCommas(obj.regionTotalDeaths);
    critical_total.innerHTML = numberWithCommas(obj.regionTotalCritical);
    axesLinearChartRegion(obj);
}

//call fetchDate for global stats
fetchData('GLOBAL');

// [global_data[0].regionTotalConfirmed, global_data[1].regionTotalConfirmed, global_data[2].regionTotalConfirmed, global_data[3].regionTotalConfirmed, global_data[4].regionTotalConfirmed]
// [global_data[0].regionTotalCritical, global_data[1].regionTotalCritical, global_data[2].regionTotalCritical, global_data[3].regionTotalCritical, global_data[4].regionTotalCritical]
// [global_data[0].regionTotalDeaths, global_data[1].regionTotalDeaths, global_data[2].regionTotalDeaths, global_data[3].regionTotalDeaths, global_data[4].regionTotalDeaths]
// [global_data[0].regionTotalRecoverd, global_data[1].regionTotalRecoverd, global_data[2].regionTotalRecoverd, global_data[3].regionTotalRecoverd, global_data[4].regionTotalRecoverd]

function axesLinearChartCountry(array) {

    if (myChart) {
        myChart.destroy();
    }

    let chartDataArray = [],
        labelsArray = ["Confirmd", "Recovered", "Deaths", "Critical"];
    // confirmedChartArray = [],
    // recoveredChartArray = [],
    // deathsChartArray = [],
    // criticalChartArray = [];

    // labelsVar.push(array.name);
    chartDataArray.push(country_list_user.latest_data.latest_confirmed);
    chartDataArray.push(country_list_user.latest_data.latest_recovered);
    chartDataArray.push(country_list_user.latest_data.latest_deaths);
    chartDataArray.push(country_list_user.latest_data.latest_critical);

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labelsArray,
            datasets: [{
                label: `${array.name}`,
                data: chartDataArray,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

function axesLinearChartRegion(obj) {
    if (myChart) {
        myChart.destroy();
    }

    let chartRegionAllCoumtriesList = [];
    obj.regionCountries.forEach(country => {
        chartRegionAllCoumtriesList.push(country.name)
    });

    let chartRegionAllCoumtriesListConfirmed = [];
    obj.regionCountries.forEach(country => {
        chartRegionAllCoumtriesListConfirmed.push(country.latest_data.latest_confirmed);
    });

    let chartRegionAllCoumtriesListRecovered = [];
    obj.regionCountries.forEach(country => {
        chartRegionAllCoumtriesListRecovered.push(country.latest_data.latest_recovered);
    });

    let chartRegionAllCoumtriesListDeaths = [];
    obj.regionCountries.forEach(country => {
        chartRegionAllCoumtriesListDeaths.push(country.latest_data.latest_deaths);
    });

    let chartRegionAllCoumtriesListCritical = [];
    obj.regionCountries.forEach(country => {
        chartRegionAllCoumtriesListCritical.push(country.latest_data.latest_critical);
    });


    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartRegionAllCoumtriesList,
            datasets: [{
                label: 'Confirmed',
                data: chartRegionAllCoumtriesListConfirmed,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }, {
                label: 'Recovered',
                data: chartRegionAllCoumtriesListRecovered,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }, {
                label: 'Deaths',
                data: chartRegionAllCoumtriesListDeaths,
                backgroundColor: [
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }, {
                label: 'Critical',
                data: chartRegionAllCoumtriesListCritical,
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};