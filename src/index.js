import "./style/index.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import { Modal } from "bootstrap";

let HAUPTPAUSE_BEACHTEN = true;
let PAUSENZEIT_1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
let PAUSENZEIT_2 = ["12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
let PAUSENZEIT_3 = ["24"];

let DAY_TO_CELL_MAP = {
  //1. Pause
  Mo1: "0_1",
  Mo2: "2_1",
  Mo3: "4_1",
  Mo4: "6_1",
  Mo5: "8_1",
  Mo6: "10_1",
  //2. Pause
  Mo7: "12_1",
  Mo8: "14_1",
  Mo9: "16_1",
  Mo10: "18_1",
  Mo11: "20_1",
  Mo12: "22_1",
  //3. Pause
  Mo13: "24_1",

  Di1: "0_2",
  Di2: "2_2",
  Di3: "4_2",
  Di4: "6_2",
  Di5: "8_2",
  Di6: "10_2",

  Di7: "12_2",
  Di8: "14_2",
  Di9: "16_2",
  Di10: "18_2",
  Di11: "20_2",
  Di12: "22_2",
  Di13: "24_2",

  Mi1: "0_3",
  Mi2: "2_3",
  Mi3: "4_3",
  Mi4: "6_3",
  Mi5: "8_3",
  Mi6: "10_3",

  Mi7: "12_3",
  Mi8: "14_3",
  Mi9: "16_3",
  Mi10: "18_3",
  Mi11: "20_3",
  Mi12: "22_3",
  Mi13: "24_3",

  Do1: "0_4",
  Do2: "2_4",
  Do3: "4_4",
  Do4: "6_4",
  Do5: "8_4",
  Do6: "10_4",

  Do7: "12_4",
  Do8: "14_4",
  Do9: "16_4",
  Do10: "18_4",
  Do11: "20_4",
  Do12: "22_4",
  Do13: "24_4",

  Fr1: "0_5",
  Fr2: "2_5",
  Fr3: "4_5",
  Fr4: "6_5",
  Fr5: "8_5",
  Fr6: "10_5",

  Fr7: "12_5",
  Fr8: "14_5",
  Fr9: "16_5",
  Fr10: "18_5",
  Fr11: "20_5",
  Fr12: "22_5",
  Fr13: "24_5",
};

let DAY_TO_VERT_MAP = {};

//converts the DayCellMap to a DayVertretungMap > Row wird um 1 erhöht, aus 1_1 (Mo1) wird 2_1
function convertDayToCellMapToDayToVertMap() {
  let keys = Object.keys(DAY_TO_CELL_MAP);
  keys.forEach((key) => {
    let tempRowColArray = DAY_TO_CELL_MAP[key].split("_");

    DAY_TO_VERT_MAP[key] = parseInt(tempRowColArray[0]) + 1 + "_" + tempRowColArray[1];
  });
}

/**
 * Person Data:
 * Entweder noOptions ODER onlyOptions!
 * noOptions = Pausenzeiten, die auf keinen Fall gewählt werden können.
 * onlyOptions = Pausenzeiten, die nur gewählt werden können.
 * jokerOptions = Pausenzeiten, die nur als Vertretungsaufsicht gewählt werden können. -> autoFillSecondTableMeta()
 * count = Anzahl der aktuell eingetragenen Pausen.
 * maxCount = Maximale Anzahl von Pausen.
 * days = Tag einer eingetragenen Pause. z.B.: [1] = Montag
 * maxPerDay = Anzahl der Pausen pro Tag.
 *
 * 1. Pause: 1-6   "Di1", "Mo2"
 * 2. Pause: 7-12
 * 3. Pause: 13
 */
let MONTAG_1 = ["Mo1", "Mo2", "Mo3", "Mo4", "Mo5", "Mo6"];
let MONTAG_2 = ["Mo7", "Mo8", "Mo9", "Mo10", "Mo11", "Mo12"];
let MONTAG_3 = ["Mo13"];
let DIENSTAG_1 = ["Di1", "Di2", "Di3", "Di4", "Di5", "Di6"];
let DIENSTAG_2 = ["Di7", "Di8", "Di9", "Di10", "Di11", "Di12"];
let DIENSTAG_3 = ["Di13"];
let MITTWOCH_1 = ["Mi1", "Mi2", "Mi3", "Mi4", "Mi5", "Mi6"];
let MITTWOCH_2 = ["Mi7", "Mi8", "Mi9", "Mi10", "Mi11", "Mi12"];
let MITTWOCH_3 = ["Mi13"];
let DONNERSTAG_1 = ["Do1", "Do2", "Do3", "Do4", "Do5", "Do6"];
let DONNERSTAG_2 = ["Do7", "Do8", "Do9", "Do10", "Do11", "Do12"];
let DONNERSTAG_3 = ["Do13"];
let FREITAG_1 = ["Fr1", "Fr2", "Fr3", "Fr4", "Fr5", "Fr6"];
let FREITAG_2 = ["Fr7", "Fr8", "Fr9", "Fr10", "Fr11", "Fr12"];
let FREITAG_3 = ["Fr13"];

let TEST_PERSON_DATA = [
  //TESTDATA
  {
    name: "Marion",
    noOptions: [].concat(MONTAG_3, DIENSTAG_2, DIENSTAG_3, MITTWOCH_3, FREITAG_2, DONNERSTAG_3),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Silke ", noOptions: [].concat(DIENSTAG_1, MITTWOCH_3, DONNERSTAG_3), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Jasminka ", noOptions: [].concat(MITTWOCH_2, MITTWOCH_3, DIENSTAG_3), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Martin",
    noOptions: [].concat(MITTWOCH_3, DONNERSTAG_3, FREITAG_2, DIENSTAG_1, DIENSTAG_3),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Teresa",
    noOptions: [].concat(DIENSTAG_1, DIENSTAG_2, DIENSTAG_3, FREITAG_1, FREITAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Kerstin ",
    noOptions: [].concat(),
    onlyOptions: [].concat(MONTAG_1, DIENSTAG_1, FREITAG_1, MONTAG_2, DONNERSTAG_2),
    jokerOptions: [],
    count: 0,
    maxCount: 1,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Iris ",
    noOptions: [].concat(MONTAG_3, DIENSTAG_3, MITTWOCH_1, FREITAG_1, FREITAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Julian", noOptions: [].concat(FREITAG_1, FREITAG_2), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Johanna", noOptions: [].concat(MONTAG_1, MONTAG_2, FREITAG_1), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Christi ", noOptions: [].concat(MITTWOCH_1, MITTWOCH_2, MITTWOCH_3), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Fabian", noOptions: [].concat(MITTWOCH_1, DONNERSTAG_1), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Nina ",
    noOptions: [].concat(MONTAG_2, MITTWOCH_2, MITTWOCH_3, DONNERSTAG_3, FREITAG_1),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Dorothea",
    noOptions: [].concat(MITTWOCH_2, MITTWOCH_3, DONNERSTAG_2, DONNERSTAG_3, MONTAG_3, DIENSTAG_3),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Lisa", noOptions: [].concat(), onlyOptions: [].concat(FREITAG_2, MONTAG_1), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Tobias",
    noOptions: [].concat(FREITAG_1, MONTAG_3, DIENSTAG_3, MITTWOCH_3, DONNERSTAG_3),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Vroni ",
    noOptions: [].concat(MONTAG_1, MONTAG_2, MONTAG_3, DIENSTAG_1, DIENSTAG_2, DIENSTAG_3),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Catrin ",
    noOptions: [].concat(MONTAG_1, MONTAG_2, MONTAG_3, MITTWOCH_1, MITTWOCH_2, FREITAG_1, FREITAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Maxi",
    noOptions: [].concat(DIENSTAG_1, DIENSTAG_2, DIENSTAG_3, FREITAG_1, FREITAG_2, MONTAG_1),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 1,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Melanie",
    noOptions: [].concat(FREITAG_1, FREITAG_2, MONTAG_3, DONNERSTAG_3, MITTWOCH_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Elena", noOptions: [].concat(), onlyOptions: [].concat(MITTWOCH_1, MITTWOCH_2), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Andre",
    noOptions: [].concat(MONTAG_1, MONTAG_2, MONTAG_3, DIENSTAG_3, MITTWOCH_3, DONNERSTAG_3, FREITAG_1, FREITAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 1,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Yunus",
    noOptions: [].concat(MONTAG_3, MITTWOCH_3, DONNERSTAG_3, FREITAG_2, FREITAG_1, MITTWOCH_2, DIENSTAG_1, DIENSTAG_3, DIENSTAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Babsi",
    noOptions: [].concat(),
    onlyOptions: [].concat(MONTAG_1, DIENSTAG_1, DONNERSTAG_1, FREITAG_1, FREITAG_2),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Andreas ", noOptions: [].concat(MITTWOCH_1, DIENSTAG_2), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Florian ", noOptions: [].concat(), onlyOptions: [].concat(MONTAG_1, MONTAG_2, MONTAG_3, MITTWOCH_1), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Julia", noOptions: [].concat(MONTAG_1, DIENSTAG_2, DONNERSTAG_1), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Alexander",
    noOptions: [].concat(DIENSTAG_1, DIENSTAG_3, DIENSTAG_2, MITTWOCH_1, MITTWOCH_2, MITTWOCH_3, DONNERSTAG_3, MONTAG_1, DONNERSTAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 1,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Mathias ", noOptions: [].concat(MONTAG_1), onlyOptions: [].concat(), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Thomas",
    noOptions: [].concat(),
    onlyOptions: [].concat(MONTAG_3, MITTWOCH_1, MITTWOCH_2, DONNERSTAG_2, DONNERSTAG_3),
    jokerOptions: [],
    count: 0,
    maxCount: 1,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Henriette", noOptions: [].concat(), onlyOptions: [].concat(DONNERSTAG_1, DONNERSTAG_2, MITTWOCH_1), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Marcel", noOptions: [].concat(), onlyOptions: [].concat(MITTWOCH_2, FREITAG_1, MITTWOCH_1), jokerOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1, hauptpause: false },
  { name: "Barbara", noOptions: [].concat(), onlyOptions: [].concat(MONTAG_2, DIENSTAG_2), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Katharina",
    noOptions: [].concat(MONTAG_2, MONTAG_3, DIENSTAG_3, MITTWOCH_1, MITTWOCH_3, FREITAG_1),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Susan ",
    noOptions: [].concat(MONTAG_3, MITTWOCH_1, MITTWOCH_2, MITTWOCH_3, FREITAG_2, DONNERSTAG_3, DONNERSTAG_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Sabine ",
    noOptions: [].concat(MONTAG_1, MONTAG_2, MONTAG_3, DIENSTAG_3, MITTWOCH_1, DONNERSTAG_3, FREITAG_1, FREITAG_2, MITTWOCH_2),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  {
    name: "Patrick ",
    noOptions: [].concat(MONTAG_3, DIENSTAG_3, MITTWOCH_3, DONNERSTAG_3),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 2,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Olga", noOptions: [].concat(), onlyOptions: [].concat(DIENSTAG_1, MONTAG_1, MONTAG_2, MONTAG_3), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
  {
    name: "Olesia",
    noOptions: [].concat(MONTAG_1, MONTAG_2, MONTAG_3, DIENSTAG_1, DIENSTAG_2, DIENSTAG_3, DONNERSTAG_1, FREITAG_1),
    onlyOptions: [].concat(),
    jokerOptions: [],
    count: 0,
    maxCount: 1,
    days: [],
    maxPerDay: 1,
    hauptpause: false,
  },
  { name: "Susanne", noOptions: [].concat(), onlyOptions: [].concat(FREITAG_1, MONTAG_1), jokerOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1, hauptpause: false },
];

let UPDATED_TEST_PERSON_DATA = [];

let TABLE_DATA = {
  rows: [
    /////////////////////////// 1. Pause ///////////////////////////
    { values: ["1. Pause", "Mo", "Di", "Mi", "Do", "Fr"], type: "header", style: "cellBold" },

    { values: ["Hauptgebäude", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Hauptgebäude Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Eingang", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Eingang Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Vor Mensaeingang", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Vor Mensaeingang Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Mensa", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Mensa Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Hartplatz", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Hartplatz Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Hinter der Hecke", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Hinter der Hecke Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    /////////////////////////// 2. Pause ///////////////////////////
    { values: ["2. Pause", "Mo", "Di", "Mi", "Do", "Fr"], type: "header", style: "cellBold" },

    { values: ["Hauptgebäude", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Hauptgebäude Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Eingang", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Eingang Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Vor Mensaeingang", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Vor Mensaeingang Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Mensa", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Mensa Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Hartplatz", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Hartplatz Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    { values: ["Hinter der Hecke", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(Hinter der Hecke Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },

    /////////////////////////// 3. Pause ///////////////////////////
    { values: ["3. Pause", "Mo", "Di", "Mi", "Do", "Fr"], type: "header", style: "cellBold" },

    { values: ["Ganztagbetreuung", "", "", "", "", "--"], type: "cell", style: "" },
    { values: ["(Ganztagbetreuung Vertretung)", "", "", "", "", "--"], type: "vert", style: "cellGrey" },
  ],
};

let META_DATA_CELLS_ARRAY = [];
let BEST_ATTEMPT = { cellArray: [], emptyCells: undefined };
let COUNTER = 0;
let LOOP_NUMBER = 1;
/////////
//START//
$(function () {
  convertDayToCellMapToDayToVertMap();
  startFillFirstTable();
  initEvents();
});

//EVENTS

function initEvents() {
  $("#dataTable").on("click", "td", function () {
    const tempName = $(this).text();
    $("#dataTable td").each(function () {
      $(this).removeClass("highlightCell");
      if ($(this).hasClass("cell") || $(this).hasClass("vert")) {
        if ($(this).text() == tempName) {
          $(this).addClass("highlightCell");
        }
      }
    });
  });
}

$("#btnImportExportModalDeleteData").on("click", function () {
  $("#textareaImportExportModal").val("");
  $("#textareaImportExportModal").select();
});

$("#btnImportExportModalCopyData").on("click", function () {
  const currentTextareaValue = $("#textareaImportExportModal").val();
  copyToClipboardAsync(currentTextareaValue);
  $("#textareaImportExportModal").select();
});
const copyToClipboardAsync = (str) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(str);
  return Promise.reject("The Clipboard API is not available.");
};

$("#btnImportExportData").on("click", function () {
  const currentCellValuesJSON = JSON.stringify(createMetaDataCellsArray(["cell", "vert"]));
  $("#textareaImportExportModal").val(currentCellValuesJSON);
});
//btn modal load data
$("#btnImportExportModalLoadData").on("click", function () {
  const currentTextareaValue = $("#textareaImportExportModal").val();
  const currentCellValues = JSON.parse(currentTextareaValue);
  fillTableWithCellArray(currentCellValues);
  highlightAllEmptyTableCells(["cell"]);
  $("#txtEmptyCells").text("empty cells: " + countAllEmptyTableCells());
});

//{ name: "Jojo", noOptions: [], onlyOptions: ["Mi1"], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
$("#btnListFirstData").on("click", function () {
  let tempValues = getValuesFromTable(["cell"]);
  let tempData = updateDataWithTableValues(TEST_PERSON_DATA, tempValues);
  $("#listFirstData").html(createListDataTable(tempData, "main"));
});
$("#btnListSecondData").on("click", function () {
  let tempValues = getValuesFromTable(["vert"]);
  let tempData = updateDataWithTableValues(TEST_PERSON_DATA, tempValues);
  $("#listSecondData").html(createListDataTable(tempData, "second"));
});

$("#btnCellValueToggle").on("click", function () {
  if ($(this).text() == "show values") {
    $(this).text("show ids");
    $("#dataTable td").each(function () {
      if ($(this).hasClass("cell") || $(this).hasClass("vert")) {
        let tempId = $(this).attr("id");
        let tempHtml = $(this).html();
        $(this).html(tempId);
        $(this).attr("id", tempHtml);
      }
    });
  } else {
    $(this).text("show values");
    $("#dataTable td").each(function () {
      if ($(this).hasClass("cell") || $(this).hasClass("vert")) {
        let tempId = $(this).attr("id");
        let tempHtml = $(this).html();
        $(this).html(tempId);
        $(this).attr("id", tempHtml);
      }
    });
  }
});

$("#btnFillFirstTable").on("click", function () {
  //  $("#listData").html("");
  $("#listFirstData").html("");
  $("#listSecondData").html("");
  $("#loadingBar").width(0 + "%");
  LOOP_NUMBER = $("#inputLoopNumber").val();
  startFillFirstTable();
  initEvents();
});

$("#btnFillSecondTable").on("click", function () {
  $("#listSecondData").html("");
  let tempValues = getValuesFromTable(["cell"]);
  let tempData = updateDataWithTableValues(TEST_PERSON_DATA, tempValues);
  UPDATED_TEST_PERSON_DATA = prepareDataForSecondRun(tempData);
  $("#loadingBar").width(0 + "%");
  LOOP_NUMBER = $("#inputLoopNumber").val();
  startFillSecondTable();
});

function prepareDataForSecondRun(personData) {
  const personDataCopy = structuredClone(personData);
  personDataCopy.forEach((person) => {
    person.maxCount = person.maxCount * 2;
    person.maxPerDay = person.maxPerDay * 2;
  });
  return personDataCopy;
}

function startFillFirstTable() {
  $("#app").html(createTable(TABLE_DATA));

  // {cell: "cell_1_1", value: "Richi", column: 1}
  META_DATA_CELLS_ARRAY = createMetaDataCellsArray(["cell"]);

  //execution start
  const startTime = Date.now();
  BEST_ATTEMPT = { cellArray: [], emptyCells: undefined };
  COUNTER = 0;

  //start loop
  fillTableLoop(LOOP_NUMBER, 500, "cell").then(function () {
    fillTableWithCellArray(BEST_ATTEMPT.cellArray);
    highlightAllEmptyTableCells(["cell"]);
    //display result
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    const loadingPercent = (COUNTER * 100) / LOOP_NUMBER;
    $("#loadingBar").width(loadingPercent + "%");
    $("#loadingText").text("Runs: " + COUNTER);
    console.log("Runs: " + COUNTER);
    console.log("Empty Cells: " + BEST_ATTEMPT.emptyCells);
    console.log("Execution time: " + executionTime + "ms");
    $("#txtEmptyCells").text("empty cells: " + countAllEmptyTableCells());
  });
}

function startFillSecondTable() {
  //clear old values
  clearTableCells("vert");

  // {cell: "cell_1_1", value: "Richi", column: 1}
  META_DATA_CELLS_ARRAY = createMetaDataCellsArray(["vert"]);
  //execution start
  const startTime = Date.now();
  BEST_ATTEMPT = { cellArray: [], emptyCells: undefined };
  COUNTER = 0;

  //start loop
  fillTableLoop(LOOP_NUMBER, 500, "vert").then(function () {
    fillTableWithCellArray(BEST_ATTEMPT.cellArray);
    highlightAllEmptyTableCells(["vert"]);
    //display result
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    const loadingPercent = (COUNTER * 100) / LOOP_NUMBER;
    $("#loadingBar").width(loadingPercent + "%");
    $("#loadingText").text("Runs: " + COUNTER);
    console.log("Runs: " + COUNTER);
    console.log("Empty Cells: " + BEST_ATTEMPT.emptyCells);
    console.log("Execution time: " + executionTime + "ms");
    $("#txtEmptyCells").text("empty cells: " + countAllEmptyTableCells());
  });
}

function clearTableCells(type) {
  $("." + type).each(function () {
    if ($(this).text() != "--") {
      $(this).text("");
    }
  });
}

//function create table
function createTable(tableData) {
  let tempTable = "<table class='table table-sm' id='dataTable'>";
  tempTable += "<tbody>";
  let headerCount = 0;

  tableData.rows.forEach((row, indexRow) => {
    tempTable += "<tr>";
    let tempType = row.type;
    let tempStyle = row.style;

    row.values.forEach((valueCol, indexCol) => {
      let alteredIndexRow = indexRow - headerCount;
      if (tempType == "header") {
        if (indexCol == 0) {
          tempTable += "<td id='firstCol_" + tempType + "_" + headerCount + "' class='" + tempStyle + " firstCol_" + tempType + "'>" + valueCol + "</td>";
          headerCount++;
        } else {
          tempTable += "<td id='" + tempType + "_" + headerCount + "' class='" + tempStyle + " " + tempType + "'>" + valueCol + "</td>";
        }
      } else {
        if (indexCol == 0) {
          tempTable += "<td id='firstCol_" + tempType + "_" + alteredIndexRow + "_" + indexCol + "' class='" + tempStyle + " firstCol_" + tempType + "'>" + valueCol + "</td>";
        } else {
          tempTable += "<td id='" + tempType + "_" + alteredIndexRow + "_" + indexCol + "' class='" + tempStyle + " " + tempType + "'>" + valueCol + "</td>";
        }
      }
    });

    tempTable += "</tr>";
  });

  tempTable += "</tbody>";
  tempTable += "</table>";
  return tempTable;
}

//creates list with data
function createListDataTable(data, title) {
  let tempHeader = "<h4>ListData Table " + title + "</h4>";
  let tempTable = "<table class='table' id='dataList" + title + "'>";
  let tempNrToDayMap = { 1: "Mo", 2: "Di", 3: "Mi", 4: "Do", 5: "Fr" };
  //let tempNrToPauseMap =
  //header
  tempTable += "<thead>";
  tempTable += "<tr>";
  tempTable += "<th class=''>Name</th>";
  tempTable += "<th class=''>noOptions</th>";
  tempTable += "<th class=''>onlyOptions</th>";
  tempTable += "<th class=''>count</th>";
  tempTable += "<th class=''>maxCount</th>";
  tempTable += "<th class=''>days</th>";
  tempTable += "<th class=''>maxPerDay</th>";
  tempTable += "</tr>";
  tempTable += "</thead>";
  tempTable += "<tbody>";
  //body
  let personCounter = 1;
  let aufsichtCounter = 0;
  let aufsichtMaxCounter = 0;

  data.forEach((row, indexRow) => {
    tempTable += "<tr>";

    tempTable += "<td class=''>" + personCounter + ". " + row.name + "</td>";

    let tempNoOptionString = createOptionString(row.noOptions);

    let tempOnlyOptionsString = createOptionString(row.onlyOptions);
    tempTable += "<td class=''>" + tempNoOptionString + "</td>";
    tempTable += "<td class=''>" + tempOnlyOptionsString + "</td>";

    if (row.count < row.maxCount) {
      tempTable += "<td class='noMaxCount'>" + row.count + "</td>";
    } else {
      tempTable += "<td class=''>" + row.count + "</td>";
    }
    tempTable += "<td class=''>" + row.maxCount + "</td>";
    tempTable += "<td class=''>" + row.days.map((day) => " " + tempNrToDayMap[day.split("_")[1]]).toString() + "</td>";
    tempTable += "<td class=''>" + row.maxPerDay + "</td>";
    tempTable += "</tr>";

    personCounter++;
    aufsichtCounter += row.count;
    aufsichtMaxCounter += row.maxCount;
  });

  tempTable += "<tr> <td></td> <td></td> <td></td> <td class='summary'>" + aufsichtCounter + "</td> <td class='summary'>" + aufsichtMaxCounter + "</td>  <td></td> <td></td> </tr>";
  tempTable += "</tbody>";
  tempTable += "</table>";
  return tempHeader + tempTable;
}

function createOptionString(optionsArray) {
  let tempNoOptionString = optionsArray;
  //Montag
  if (checkIfArrayContainsAllValues(tempNoOptionString, MONTAG_1)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !MONTAG_1.includes(option);
    });
    tempNoOptionString.push("MO (1. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, MONTAG_2)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !MONTAG_2.includes(option);
    });
    tempNoOptionString.push("MO (2. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, MONTAG_3)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !MONTAG_3.includes(option);
    });
    tempNoOptionString.push("MO (3. Pause)");
  }
  //Dienstag
  if (checkIfArrayContainsAllValues(tempNoOptionString, DIENSTAG_1)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !DIENSTAG_1.includes(option);
    });
    tempNoOptionString.push("DI (1. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, DIENSTAG_2)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !DIENSTAG_2.includes(option);
    });
    tempNoOptionString.push("DI (2. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, DIENSTAG_3)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !DIENSTAG_3.includes(option);
    });
    tempNoOptionString.push("DI (3. Pause)");
  }
  //Mittwoch
  if (checkIfArrayContainsAllValues(tempNoOptionString, MITTWOCH_1)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !MITTWOCH_1.includes(option);
    });
    tempNoOptionString.push("MI (1. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, MITTWOCH_2)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !MITTWOCH_2.includes(option);
    });
    tempNoOptionString.push("MI (2. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, MITTWOCH_3)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !MITTWOCH_3.includes(option);
    });
    tempNoOptionString.push("MI (3. Pause)");
  }
  //Donnerstag
  if (checkIfArrayContainsAllValues(tempNoOptionString, DONNERSTAG_1)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !DONNERSTAG_1.includes(option);
    });
    tempNoOptionString.push("DO (1. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, DONNERSTAG_2)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !DONNERSTAG_2.includes(option);
    });
    tempNoOptionString.push("DO (2. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, DONNERSTAG_3)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !DONNERSTAG_3.includes(option);
    });
    tempNoOptionString.push("DO (3. Pause)");
  }
  //Freitag
  if (checkIfArrayContainsAllValues(tempNoOptionString, FREITAG_1)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !FREITAG_1.includes(option);
    });
    tempNoOptionString.push("FR (1. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, FREITAG_2)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !FREITAG_2.includes(option);
    });
    tempNoOptionString.push("FR (2. Pause)");
  }
  if (checkIfArrayContainsAllValues(tempNoOptionString, FREITAG_3)) {
    tempNoOptionString = tempNoOptionString.filter(function (option) {
      return !FREITAG_3.includes(option);
    });
    tempNoOptionString.push("FR (3. Pause)");
  }

  return tempNoOptionString.join(" | ");
}

function checkIfArrayContainsAllValues(arrayToCheck, allValuesArray) {
  let allValuesArrayLength = allValuesArray.length;
  let valuesFound = 0;
  arrayToCheck.forEach((value) => {
    if (allValuesArray.includes(value)) {
      valuesFound++;
    }
  });
  if (valuesFound >= allValuesArrayLength) {
    return true;
  } else {
    return false;
  }
}

function isCellObjectEmpty(cell) {
  if ($(cell).html() == "") {
    return true;
  } else {
    return false;
  }
}

$("#btnCountEmptyCells").on("click", function () {
  $("#txtEmptyCells").text("empty cells: " + countAllEmptyTableCells());
});

function countAllEmptyTableCells() {
  return getAllEmptyTableCells().length;
}

function getAllEmptyTableCells() {
  let allEmptyCellArray = [];
  $("#dataTable td").each(function (index) {
    if (isCellObjectEmpty($(this))) {
      allEmptyCellArray.push($(this));
    }
  });
  return allEmptyCellArray;
}

function highlightAllEmptyTableCells(typesArray) {
  typesArray.forEach((type) => {
    $("." + type).each(function () {
      $(this).removeClass("emptyCell");
      if (isCellObjectEmpty($(this))) {
        $(this).addClass("emptyCell");
      }
    });
  });
}

//function fill table based on cell array
function fillTableWithCellArray(cellArray) {
  cellArray.forEach((cell) => {
    $("#" + cell.id).html(cell.value);
  });
}

function createMetaDataCellsArray(typesArray) {
  let metaDataCellsArray = [];
  typesArray.forEach((type) => {
    $("." + type).each(function () {
      metaDataCellsArray.push({ id: $(this).attr("id"), value: $(this).text(), row: $(this).attr("id").split("_")[1], column: $(this).attr("id").split("_")[2] }); //cell_2_1
    });
  });
  return metaDataCellsArray;
}

//function creates array of all cell values, typesArray = ["cell","vert",...]
function getValuesFromTable(typesArray) {
  let dataCellsArray = [];
  typesArray.forEach((type) => {
    $("." + type).each(function () {
      let tempRow = $(this).attr("id").split("_")[1];
      let tempColumn = $(this).attr("id").split("_")[2];
      dataCellsArray.push({ row: tempRow, column: tempColumn, name: $(this).html() });
    });
  });
  return dataCellsArray;
}

function updateDataWithTableValues(personData, tableValues) {
  const personDataCopy = structuredClone(personData);
  personDataCopy.forEach((person) => {
    tableValues.forEach((value) => {
      if (person.name == value.name) {
        person.count = person.count + 1;
        person.days.push(value.row + "_" + value.column);
      }
    });
  });
  return personDataCopy;
}

function countEmptyMetaTableCells(tableMetaData) {
  let emptyMetaCells = 0;

  tableMetaData.forEach((cell) => {
    if (cell.value == "") emptyMetaCells++;
  });

  return emptyMetaCells;
}

//function shuffle array based on the Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//fill first table
function autoFillFirstTableMeta(cellArray, dataPersons) {
  // Create a deep copy
  const cellArrayCopy = structuredClone(cellArray);
  const dataPersonsCopy = structuredClone(dataPersons);
  //shuffle cell array
  const allMetaTableCells = shuffleArray(cellArrayCopy);

  //checks to find right person
  allMetaTableCells.forEach((cell) => {
    let personAddedToCell = false;
    //check 1) is cell empty?
    if (cell.value == "") {
      dataPersonsCopy.forEach((person) => {
        //check 2) is no person already added to cell && is person maxCount < count && person is not > maxPerDay in column
        if (!personAddedToCell && person.count < person.maxCount && !(countDayColumns(person.days, cell.column) >= person.maxPerDay)) {
          //check 2.1) hauptpause
          if (!HAUPTPAUSE_BEACHTEN || !isHauptpause(cell) || (isHauptpause(cell) && !person.hauptpause)) {
            let noOptionArray = person.noOptions.map((noOption) => "cell_" + DAY_TO_CELL_MAP[noOption]);
            let onlyOptionArray = person.onlyOptions.map((onlyOption) => "cell_" + DAY_TO_CELL_MAP[onlyOption]);

            //check 3) can person be in cell based on noOption?
            if (onlyOptionArray.length > 0) {
              if (onlyOptionArray.includes(cell.id)) {
                cell.value = person.name;
                person.count = person.count + 1;
                person.days.push(cell.row + "_" + cell.column);
                personAddedToCell = true;
                if (isHauptpause(cell)) person.hauptpause = true;
              }
            } else if (!noOptionArray.includes(cell.id)) {
              //add person to cell
              cell.value = person.name;
              person.count = person.count + 1;
              person.days.push(cell.row + "_" + cell.column);
              personAddedToCell = true;
              if (isHauptpause(cell)) person.hauptpause = true;
            }
          }
        }
      });
    }
  });

  return allMetaTableCells;
}

function isHauptpause(cell) {
  if (PAUSENZEIT_2.includes(cell.row)) return true;
  else return false;
}

//fill second table
function autoFillSecondTableMeta(cellArray, dataPersons) {
  // Create a deep copy
  const cellArrayCopy = structuredClone(cellArray);
  const dataPersonsCopy = structuredClone(dataPersons);
  //shuffle cell array
  const allMetaTableCells = shuffleArray(cellArrayCopy);

  //checks to find right person
  allMetaTableCells.forEach((cell) => {
    let personAddedToCell = false;
    //check 1) is cell empty?
    if (cell.value == "") {
      dataPersonsCopy.forEach((person) => {
        //check 2) is no person already added to cell && is person maxCount < count && person is not > maxPerDay in column
        if (!personAddedToCell && person.count < person.maxCount && !(countDayColumns(person.days, cell.column) >= person.maxPerDay)) {
          //check 2.1) Vertretung: nur Vertretung, wenn in normal row (= row -1) nicht schon eine pause ist
          if (!hasPersonAufsichtZurGleichenZeit(person.days, cell)) {
            let noOptionArray = person.noOptions.map((noOption) => "vert_" + DAY_TO_VERT_MAP[noOption]);
            let onlyOptionArray = person.onlyOptions.map((onlyOption) => "vert_" + DAY_TO_VERT_MAP[onlyOption]);

            //check 3) can person be in cell based on noOption?
            if (onlyOptionArray.length > 0) {
              if (onlyOptionArray.includes(cell.id)) {
                cell.value = person.name;
                person.count = person.count + 1;
                person.days.push(cell.row + "_" + cell.column);
                personAddedToCell = true;
              }
            } else if (!noOptionArray.includes(cell.id)) {
              //add person to cell
              cell.value = person.name;
              person.count = person.count + 1;
              person.days.push(cell.row + "_" + cell.column);
              personAddedToCell = true;
            }
          }
        }
      });
    }
  });

  return allMetaTableCells;
}

//function: prüft ob die Person bereits eine Aufsicht zur gleichen Zeit hat. Zeiten: 1. Pause, 2. Pause, 3. Pause
function hasPersonAufsichtZurGleichenZeit(days, cell) {
  let cellString = cell.row + "_" + cell.column;
  let tempPausenzeitCell = getPausenZeit(cellString);
  let tempPausenzeitenDays = days.map((day) => getPausenZeit(day));

  if (tempPausenzeitenDays.includes(tempPausenzeitCell)) {
    return true;
  } else {
    return false;
  }
}

//Liefert die Pausenzeit 1-2 eines day oder einer cell zurück (cellString 2_1)
function getPausenZeit(cellString) {
  let rowColArray = cellString.split("_");
  let tempRow = rowColArray[0];
  let tempCol = rowColArray[1];

  if (PAUSENZEIT_1.includes(tempRow)) {
    return "1_" + tempCol;
  } else if (PAUSENZEIT_2.includes(tempRow)) {
    return "2_" + tempCol;
  } else {
    return 0;
  }
}

function countDayColumns(days, cellColumn) {
  const count = {};
  const daysColumnArray = days.map((day) => day.split("_")[1]);
  daysColumnArray.forEach((day) => {
    count[day] = (count[day] || 0) + 1;
  });
  return count[cellColumn];
}

function printMetaData(tableMetaData) {
  console.log("--------------------------");
  tableMetaData.forEach((cell) => {
    console.log(cell.id + " " + cell.value);
  });
  console.log("--------------------------");
}

async function fillTableLoop(maxAttempts, updateUiEveryNCounts, type) {
  while (COUNTER < maxAttempts) {
    COUNTER++;

    let tempSolution = undefined;
    if (type == "cell") {
      tempSolution = autoFillFirstTableMeta(META_DATA_CELLS_ARRAY, TEST_PERSON_DATA);
    } else if (type == "vert") {
      tempSolution = autoFillSecondTableMeta(META_DATA_CELLS_ARRAY, UPDATED_TEST_PERSON_DATA);
    }

    let tempEmptyCells = countEmptyMetaTableCells(tempSolution);
    if (BEST_ATTEMPT.emptyCells == undefined || BEST_ATTEMPT.emptyCells >= tempEmptyCells) {
      BEST_ATTEMPT.cellArray = tempSolution;
      BEST_ATTEMPT.emptyCells = tempEmptyCells;
    }
    if (COUNTER % updateUiEveryNCounts == 0) {
      await myTimeout(1);
      const loadingPercent = (COUNTER * 100) / LOOP_NUMBER;
      $("#loadingBar").width(loadingPercent + "%");
      $("#loadingText").text("Runs: " + COUNTER);
    }
    if (tempEmptyCells == 0) {
      break;
    }
  }
}

function myTimeout(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
