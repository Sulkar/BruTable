import "./style/index.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import { Modal } from "bootstrap";

let TEST_PERSON_DATA = [
  { name: "Richi", noOptions: ["1_2", "3_1", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Susi", noOptions: ["1_1", "3_1", "1_2", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Kerstin", noOptions: ["1_1", "3_2"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Andi", noOptions: ["1_1", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Sarah", noOptions: ["1_1", "1_2", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Simon", noOptions: ["1_1", "3_3", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },

  { name: "Gustav", noOptions: ["1_1", "1_5", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Gina", noOptions: ["1_1", "4_5", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Dominik", noOptions: ["1_1", "4_1"], onlyOptions: [], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
  { name: "Marie", noOptions: ["1_1", "4_1"], onlyOptions: [], count: 0, maxCount: 1, days: [], maxPerDay: 1 },
  { name: "Jojo", noOptions: [], onlyOptions: ["3_3"], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
];

let TABLE_DATA = {
  rows: [
    { values: ["Place", "Mo", "Di", "Mi", "Do", "Fr"], type: "header", style: "cellBold" },
    { values: ["P1", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(P1 Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },
    { values: ["P2", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(P2 Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },
    { values: ["Place", "Mo", "Di", "Mi", "Do", "Fr"], type: "header", style: "cellBold" },
    { values: ["P1", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(P1 Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },
    { values: ["P2", "", "", "", "", ""], type: "cell", style: "" },
    { values: ["(P2 Vertretung)", "", "", "", "", ""], type: "vert", style: "cellGrey" },
  ],
};

let META_DATA_CELLS_ARRAY = [];
let BEST_ATTEMPT = { cellArray: [], emptyCells: undefined };
let COUNTER = 0;
let LOOP_NUMBER = 100;
/////////
//START//
$(function () {
  startFillTable();
});

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
  const currentCellValuesJSON = JSON.stringify(BEST_ATTEMPT.cellArray);
  $("#textareaImportExportModal").val(currentCellValuesJSON);
});
//btn modal load data
$("#btnImportExportModalLoadData").on("click", function () {
  const currentTextareaValue = $("#textareaImportExportModal").val();
  const currentCellValues = JSON.parse(currentTextareaValue);
  fillTableWithCellArray(currentCellValues);
  highlightAllEmptyTableCells(["cell"]);
});

//{ name: "Jojo", noOptions: [], onlyOptions: ["3_3"], count: 0, maxCount: 2, days: [], maxPerDay: 1 },
$("#btnListData").on("click", function () {
  let tempValues = getValuesFromTable(["cell"]);
  let tempData = updateDataWithTableValues(TEST_PERSON_DATA, tempValues);
  $("#listData").html(createListDataTable(tempData));
});

$("#btnCellValueToggle").on("click", function () {
  if ($(this).text() == "show values") {
    $(this).text("show ids");
    $("#dataTable td").each(function () {
      let tempId = $(this).attr("id");
      let tempHtml = $(this).html();
      $(this).html(tempId);
      $(this).attr("id", tempHtml);
    });
  } else {
    $(this).text("show values");
    $("#dataTable td").each(function () {
      let tempId = $(this).attr("id");
      let tempHtml = $(this).html();
      $(this).html(tempId);
      $(this).attr("id", tempHtml);
    });
  }
});

$("#btnFillTable").on("click", function () {
  $("#listData").html("");
  $("#loadingBar").width(0 + "%");
  LOOP_NUMBER = $("#inputLoopNumber").val();
  startFillTable();
});

function startFillTable() {
  $("#app").html(createTable(TABLE_DATA));

  // {cell: "cell_1_1", value: "Richi", column: 1}
  META_DATA_CELLS_ARRAY = createMetaDataCellsArray("cell");

  //execution start
  const startTime = Date.now();
  BEST_ATTEMPT = { cellArray: [], emptyCells: undefined };
  COUNTER = 0;

  //start loop
  fillTableLoop(LOOP_NUMBER, 500).then(function () {
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
  });
}

//function create table
function createTable(tableData) {
  let tempTable = "<table class='table' id='dataTable'>";
  tempTable += "<tbody>";

  tableData.rows.forEach((row, indexRow) => {
    tempTable += "<tr>";
    let tempType = row.type;
    let tempStyle = row.style;
    row.values.forEach((valueCol, indexCol) => {
      tempTable += "<td id='" + tempType + "_" + indexRow + "_" + indexCol + "' class='" + tempStyle + " " + tempType + "'>" + valueCol + "</td>";
    });

    tempTable += "</tr>";
  });

  tempTable += "</tbody>";
  tempTable += "</table>";
  return tempTable;
}

//creates list with data
function createListDataTable(data) {
  let tempHeader = "<h4>ListData Table</h4>";
  let tempTable = "<table class='table' id='dataList'>";
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
  data.forEach((row, indexRow) => {
    tempTable += "<tr>";

    tempTable += "<td class=''>" + row.name + "</td>";
    let tempNoOptionString = row.noOptions
      .map((noOPtion) => " " + tempNrToDayMap[noOPtion.split("_")[1]] + noOPtion.split("_")[0])
      .sort()
      .toString();
    let tempOnlyOptionsString = row.onlyOptions
      .map((onlyOption) => " " + tempNrToDayMap[onlyOption.split("_")[1]] + onlyOption.split("_")[0])
      .sort()
      .toString();
    tempTable += "<td class=''>" + tempNoOptionString + "</td>";
    tempTable += "<td class=''>" + tempOnlyOptionsString + "</td>";

    if (row.count < row.maxCount) {
      tempTable += "<td class='noMaxCount'>" + row.count + "</td>";
    } else {
      tempTable += "<td class=''>" + row.count + "</td>";
    }

    tempTable += "<td class=''>" + row.maxCount + "</td>";

    tempTable += "<td class=''>" + row.days.map((day) => " " + tempNrToDayMap[day]).toString() + "</td>";
    tempTable += "<td class=''>" + row.maxPerDay + "</td>";
    tempTable += "</tr>";
  });

  tempTable += "</tbody>";
  tempTable += "</table>";
  return tempHeader + tempTable;
}

function isCellObjectEmpty(cell) {
  if ($(cell).html() == "") {
    return true;
  } else {
    return false;
  }
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

function createMetaDataCellsArray(type) {
  let metaDataCellsArray = [];
  $("." + type).each(function () {
    metaDataCellsArray.push({ id: $(this).attr("id"), value: $(this).text(), column: $(this).attr("id").split("_")[2] }); //cell_2_1
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
        person.days.push(value.column);
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

function autoFillTableMeta(cellArray, dataPersons) {
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
          let noOptionArray = person.noOptions.map((noOption) => "cell_" + noOption);
          let onlyOptionArray = person.onlyOptions.map((onlyOption) => "cell_" + onlyOption);
          //check 3) can person be in cell based on noOption?
          if (onlyOptionArray.length > 0) {
            if (onlyOptionArray.includes(cell.id)) {
              cell.value = person.name;
              person.count = person.count + 1;
              person.days.push(cell.column);
              personAddedToCell = true;
            }
          } else if (!noOptionArray.includes(cell.id)) {
            //add person to cell
            cell.value = person.name;
            person.count = person.count + 1;
            person.days.push(cell.column);
            personAddedToCell = true;
          }
        }
      });
    }
  });

  return allMetaTableCells;
}

function countDayColumns(days, cellColumn) {
  const count = {};
  days.forEach((day) => {
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

async function fillTableLoop(maxAttempts, updateUiEveryNCounts) {
  while (COUNTER < maxAttempts) {
    COUNTER++;
    let tempSolution = autoFillTableMeta(META_DATA_CELLS_ARRAY, TEST_PERSON_DATA);
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
