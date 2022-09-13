/* to dos:
*  NEXT: onclick aktion
*  - alle fehlerfälle abfangen
*  BUGS:
*      -
*  next:
*  sync mit owncloud oder couchdb
*  anpassen für Fairphone
*/

/* class ShopTablesRow for ShopTables
*  - save all properties for elements of the row
*  - create a sting to save it
*  - eatch row has a unique ID */
class ShopTablesRow{
  //funtion for '+' and '-' buttons
  static btnNewRow = null;
  static btnDelRow = null;
  static chkBoxChanged = null;
  /* create all element and set default values
  *  Parameter:
  *     row:          TableRow Objekt
  *     secondPieces: append a second input for Pieces? */
  constructor(row, id, secondPieces=false){
    this.secondPieces = secondPieces;
    //create Elements
    this.inputText = document.createElement("textarea");
    this.inputText.cols = "20";
    this.inputText.setAttribute("class", "gridItemTA textSize");
    this.inputText.setAttribute("style", "grid-column-start:1");

    this.inputPieceText = [document.createTextNode("Stück:"), document.createTextNode("Stück:")]; // default values
    this.inputPieces = [document.createElement("input"), document.createElement("input")];
    this.inputPieces[0].type = "text";
    this.inputPieces[0].size = "3";
    this.inputPieces[0].setAttribute("class", "textSize");
    this.inputPieces[0].setAttribute("style", "grid-column-start:2");
    this.inputPieces[1].type = "text";
    this.inputPieces[1].size = "3";
    this.inputPieces[1].setAttribute("class", "textSize");
    this.inputPieces[1].setAttribute("style", "grid-column-start:4");

    this.chkBox = document.createElement('input');
    this.chkBox.type = "checkbox";
    this.chkBox.setAttribute("class", "switchOn")
    this.chkBox.name = "gekauft";
    this.chkBox.setAttribute("onclick", "ShopTablesRow.chkBoxChanged("+id+", this)");
    this.chkBox.setAttribute("style", "grid-column-start:6");

    this.btnPlus = document.createElement('input');
    this.btnPlus.type = "button";
    this.btnPlus.setAttribute("class", "textSize switchOff");
    this.btnPlus.value = "+";
    this.btnPlus.setAttribute("style", "grid-column-start:5");
    this.btnPlus.setAttribute("onclick", "ShopTablesRow.btnNewRow("+id+")");

    this.btnMinus = document.createElement('input');
    this.btnMinus.type = "button";
    this.btnMinus.setAttribute("class", "textSize switchOff");
    this.btnMinus.value = "-";
    this.btnMinus.setAttribute("style", "grid-column-start:6");
    this.btnMinus.setAttribute("onclick", "ShopTablesRow.btnDelRow("+id+")");

    this.id = id;
    this.row = row;
    this.row.setAttribute("data-id", String(this.id));
    this.cell = this.row.insertCell(0);
    this.cell.setAttribute("class", "cellDisplay");

    //Add all element to cell
    this.cell.appendChild(this.inputText);

    this.spans = [document.createElement("span"), document.createElement("span")];
    this.spans[0].style.margin = "auto"
    this.spans[0].style.grid_column_start = "1";
    this.spans[0].setAttribute("class", "textSize");
    this.spans[0].appendChild(this.inputPieceText[0]);
    this.cell.appendChild(this.spans[0]);
    this.cell.appendChild(this.inputPieces[0]);

    this.spans[1].style.margin = "auto"
    this.spans[1].style.grid_column_start = "3";
    this.spans[1].setAttribute("class", "textSize");
    this.spans[1].appendChild(this.inputPieceText[1]);
    this.cell.appendChild(this.spans[1]);
    this.cell.appendChild(this.inputPieces[1]);

    if(!this.secondPieces){
      this.spans[1].style.visibility = "hidden";
      this.spans[1].setAttribute("class", "hideMe");
      this.inputPieces[1].style.visibility = "hidden";
      this.inputPieces[1].setAttribute("class", "hideMe");
    }

    this.cell.appendChild(this.chkBox);
    this.cell.appendChild(this.btnPlus);
    this.cell.appendChild(this.btnMinus);
  }

  /* Set the Text for inputText
  *  Parameter: Text */
  setText(text){
    this.inputText.value = text;
  }

  /* Set the Text for inputPiece
  *  Parameter:
      - piece1: first Piece string
      - piece2:  second Piece string. defualt=""*/
  setPieces(piece1, piece2=""){
    this.inputPieces[0].value = piece1;
    this.inputPieces[1].value = piece2;
  }

  /* Set the Text for inputPieceText.
  *  Is last character not a ":", append ones.
  *  Parameter:
      - name1
      - name2: defualt="" */
  setPiecesNames(name1, name2=""){
    if(name1.substr(name1.length - 1) !== ":")
      name1 += ":";
    if(name2 !== "" && name2.substr(name2.length - 1) !== ":")
      name2 += ":";
    this.inputPieceText[0].data = name1;
    this.inputPieceText[1].data = name2;
  }

  // clear inputPiece text
  clearPieces(){
    this.inputPieces[0].value = "";
    this.inputPieces[1].value = "";
  }

  // get Parameter as a Sting like: "inputText_inputPiece_inputPiece;"
  getStr(){
    var text = this.inputText.value.trim().replace(/_/g, ",").replace(/;/g, ",").replace(/[\n\r]/g, "<br>")+"_";
    text += this.inputPieces[0].value.trim().replace(/_/g, ",").replace(/;/g, ",")+"_";
    text += this.inputPieces[1].value.trim().replace(/_/g, ",").replace(/;/g, ",")+ ";";
    return text;
  }
}

/* Conteins two Tables
*  - the first table for edit and schoping
*  - the second table is a copy of the firts, but all rows are hidden
*  - the rows of the second tabel are visibel, if the checkbox are checkt
*  - the class sysncronize the tables at load and save aktions */
class ShopTables{
  constructor(name, second = false){
    this.showSecondPieces = second;
    this.eTable = document.createElement("table");
    //this.eTable.style.width =  "100%";
    this.eTable.dataset.name = name;
    this.sTable = document.createElement("table");
    //this.sTable.style.width =  "100%";
    this.sTable.dataset.name = name;
    this.name = name;
    this.tableRows = new Map();
    this.nextRowID = 0;
  }

  getRowIndex(id){
    for(let i in this.eTable.rows){
      if(this.eTable.rows[i].dataset.id === id.toString())
        return i;
    }
    return null;
  }

  /* insert a new row to both Tables after rowIndex
  ** Increment nextRowID
  ** if 'text' and pieces are set, take it to row elements
  ** set the visibility from sTables rows to none */
  newRow(rowIndex, text="", piece1="", piece2=""){
    var array = [];
    var row = this.eTable.insertRow(rowIndex);
    array.push(new ShopTablesRow(row, this.nextRowID, this.showSecondPieces));
    row = this.sTable.insertRow(rowIndex);
    row.style.display = "none";
    array.push(new ShopTablesRow(row, this.nextRowID, this.showSecondPieces));
    this.tableRows.set(this.nextRowID, array);
    this.nextRowID += 1;

    if (text !== ""){
      array[0].setText(text);
      array[1].setText(text);
      if(piece1 !== ""){
        array[0].setPieces(piece1, piece2);
        array[1].setPieces(piece1, piece2);
      }
    }
  }

  insertRow(id){
    let index = this.getRowIndex(id);
    if (index) this.newRow(Number(index)+1);
  }

  //return row with id from eTabel and sTable
  getRows(id){
    return this.tableRows.get(id);
  }

  //clear all Pieces in rows
  clearAllPieces(){
    for (let array of this.tableRows.values()){
      array[0].clearPieces();
      array[1].clearPieces();
    }
  }

  /*remove row with id from eTabel and sTable
  *the las row are only cleard  */
  removeRow(id){
    if(this.tableRows.size > 1){  //has more then one row
      var index = this.getRowIndex(id);
      this.eTable.deleteRow(index);
      this.sTable.deleteRow(index);
      this.tableRows.delete(id);
    }else{  //only one row
      //clear elements
      this.tableRows.get(id)[0].clearPieces();
      this.tableRows.get(id)[1].clearPieces();
      this.tableRows.get(id)[0].setText("");
      this.tableRows.get(id)[1].setText("");
    }
  }

  removeAllRows(){
    for (let id of this.tableRows.keys()){
      this.removeRow(id);
    }
  }

  /* set the checkboxs in rows to 'check'
  ** and set the visibilite for rows depending on 'check' */
  setCheckBox(rowID, check){
    var rows = this.tableRows.get(rowID);
    rows[0].chkBox.checked = check;
    rows[0].row.style.display = check ? "none":"table-row";
    rows[1].chkBox.checked = check;
    rows[1].row.style.display = check ? "table-row":"none";
  }

  //return the string for LocalStorage
  getStr(){
    var str = "";
    for(let row of this.eTable.rows){
      str += this.tableRows.get(parseInt(row.dataset.id))[0].getStr();
    }
    return str;
  }

  //copy value from eTabel to sTable
  syncTables(){
    for (let array of this.tableRows.values()){
      array[1].setText(array[0].inputText.value);
      array[1].setPieces(array[0].inputPieces[0].value, array[0].inputPieces[1].value);
    }
  }

  //reset all checkbox and visibility of row
  resetCheckboxs(){
    for (let [id, row] of this.tableRows){
      this.setCheckBox(id);
      row[0].row.style.display = "table-row";
    }
  }

  //hide all rows with unset or eampty Pieces
  hideAllWithoutPieces(){
    for (let row of this.tableRows.values()){
      //a && !s || a && b => a || (!s && b)
      if((row[0].inputPieces[0].value === "" || row[0].inputPieces[0].value === "0") ||
         (row[0].secondPieces && (row[0].inputPieces[1].value === "" || row[0].inputPieces[1].value === "0")))
         row[0].row.style.display = "none";
    }
  }
}

/* Manage ShopTables
*  Create and delet tables
*  load data from localStorage to create ShopTables
*  Save data from ShopTables to localStorage */
class ShoppingLists{
  //crate a empty list
  constructor(){
    this.tableList = new Map();
    this.showSecondPieces = false;
  }

  /* create a new schop with "name" and add a emty row
  ** "name" have to ba valid and not already in List
  ** else return null */
  newShop(name){
    if(name && name !== "" && !this.tableList.has(name)){
      let shop = new ShopTables(name, this.showSecondPieces);
      this.tableList.set(name, shop);
      shop.newRow(0);
      return shop;
    }
    else return null;
  }

  //rename ShopTables if "newNAme" valid and not already in List
  rename(name, newName){
    if(name && name !== "" && newName && newName !== "" && !this.tableList.has(newName)){
      var shop = this.tableList.get(name);
      shop.name = newName;
      this.tableList.set(newName, shop)
                    .delete(name);
      this.removeFreomLocalStorage(name);
      this.saveToLocalStorage(newName);
      return true;
    }else return false;
  }

  /* returns the ShopTables with "name"
  ** if "name" is invalid, return the first Shop
  ** is tableList eampty return null */
  getShop(name){
    if(name && name !== ""){
      return this.tableList.get(name);
    }else if (this.tableList.size > 0){
      let [firstName] = this.tableList.keys();
      return this.tableList.get(firstName);
    }
    else return null;
  }

  //remove table with "name" from list
  remove(name){
    if(name && name !== ""){
      let shop = this.tableList.get(name);
      this.tableList.delete(name);
      delete shop.this;
      this.removeFreomLocalStorage(name);
    }
  }

  /* write string from table with "name" to LocalStorage
  *  if name ist not set, save all tables */
  saveToLocalStorage(name=""){
    let str = "";
    if (!name || name === ""){
      for (let [key, shop] of this.tableList){
        str = shop.getStr();
        localStorage.setItem(key, str);
      }
    }else if(this.tableList.has(name)){
      str = this.tableList.get(name).getStr();
      localStorage.setItem(name, str);
    }
    return str;
  }

  //read all shops from LocalStorage and create objects
  loadFromLocalStorage(){
    let shops = Object.keys(localStorage);
    for(let name of shops){
      let shop = new ShopTables(name, this.showSecondPieces);
      this.tableList.set(name, shop);
      let rows = localStorage.getItem(name).split(";");
      if(rows.length == 0){ //if value from localStorage empty
        shop.newRow(0);
      }else{
        rows.pop(); //remove emty entry on the end
        rows.forEach((items, i) => {
          items = items.split("_");
          shop.newRow(i, items[0], items[1], items[2]);
        });
      }
    }
  }

  removeFreomLocalStorage(name){
    localStorage.removeItem(name);
  }

  /* hide all rows with unset or eampty Pieces
  ** or show all rows*/
  setRowVisibility(hide){
    for(let shop of this.tableList.values()){
      hide ? shop.hideAllWithoutPieces() : shop.resetCheckboxs();
    }
  }
}
