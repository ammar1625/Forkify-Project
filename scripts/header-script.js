
"use strict";

//dom elements

/*header elements*/
let searchBtnEl = document.querySelector(".search-btn");
let searchInputEl = document.querySelector(".search-input");
let bookMarksBtnEl = document.querySelector(".book-marks-btn");
let addReciepeBtnEl = document.querySelector(".add-reciep-btn");




/*left side elements*/ 
let foodListItemsEl = document.querySelectorAll(".food-list-item");  /*not needed*/ 
let foodListContainerEl = document.querySelector(".foods-list-ctr");
let nextPagingBtn = document.querySelector(".next");
let prevPagingBtn = document.querySelector(".prev");

let nextNumEl = document.querySelector(".next-num");
let prevNumEl = document.querySelector(".prev-num");


/*main page dom elements*/
let mainImageEl = document.querySelector(".main-img");
let nameEl = document.querySelector(".name"); 
let timeEl =document.querySelector(".time");
let servingsEl = document.querySelector(".people");
let increaseEl = document.querySelector(".add");
let decreaseEl = document.querySelector(".remove");
let ingredientsCtrEl = document.querySelector(".ingredients");
let publisherEl = document.querySelector(".cooker");
let saveToBookMarksEl = document.querySelector(".save-to-book-mark-icon");
let bookMarksListCtrEl = document.querySelector(".right-list");
let bodySectionEl = document.querySelector(".body-section");


/*overlay and model elements*/

let overlayEl = document.querySelector(".overlay");
let modelEl = document.querySelector(".model");
let closeBtnEl = document.querySelector(".close-btn");




//data elements

class clsReciepe
{
    id;
    image_url;
    title;
    publisher;
    constructor(id,image_url , title , publisher)
    {
        this.id = id;
        this.image_url = image_url;
        this.title = title;
        this.publisher = publisher;
    }
}

let bookMarksArr =JSON.parse(localStorage.getItem("book-marks"))|| [];

let msg = `<h1 class="no-result-message">⚠️    No reciepes found inside your book marks!</h1>`
renderReciepsList(bookMarksArr,bookMarksListCtrEl , msg);

function hideMainSection()
{
    bodySectionEl.style.visibility = "hidden";
}

hideMainSection();


//`https://forkify-api.herokuapp.com/api/v2/recipes?search=tacos`

function showMainSection()
{
    bodySectionEl.style.visibility = "visible";

}

async function getReciepesListByName(name)
{
    try
    {
        let reciepsResponse = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${name}`);

        if(!reciepsResponse.ok)
            {
                throw new Error(`${reciepsResponse.statusText}`);
            }
        let reciepesData = await reciepsResponse.json();

        return reciepesData.data.recipes;
    }
    catch(err)
    {
        return null;
    }

    
}

function renderReciepsList(reciepes , reciepesListCtr , message)
{
    
    reciepesListCtr.innerHTML = "";
    let emptyMessage = message;
    if(reciepes.length ===0)
        {
            reciepesListCtr.innerHTML =  emptyMessage;
            return;
        }
    for(let reciepe of reciepes)
        {
             let html = `
                <div class="food-list-item" data-reciepe-id=${reciepe.id}>
                        <img src=${reciepe.image_url} alt="food" class="food-img">

                        <div class="food-infos-ctr">
                            <h1 class="food-name">${reciepe.title}</h1>
                            <h2 class="cooker-name">${reciepe.publisher}</h2>
                        </div>
                    </div>
            `;

            reciepesListCtr.insertAdjacentHTML("beforeend", html);
        }
    
}

function updateNextAndPrevPagesNumbers(prev ,next)
{
    prevNumEl.textContent = prev;
    nextNumEl.textContent = next;
}

function hideBtn(btn)
{
    btn.style.visibility = "hidden";
}

function showBtn(btn)
{
    btn.style.visibility = "visible";

}

function updateBtnVisibilityState(current , total)
{
    if(current=== total)
        {
            hideBtn(nextPagingBtn);
            showBtn(prevPagingBtn);
        } 
        else if(current === 1)
            {
                hideBtn(prevPagingBtn);
                showBtn(nextPagingBtn);
            }
            else
            {
                showBtn(nextPagingBtn);
                showBtn(prevPagingBtn);
            }
}
function switchPages( responseArr ,  currPage , totalPages , startI , endI)
{
   
    nextPagingBtn.addEventListener("click",function(){
                        
        if(currPage===totalPages)
            {
                return;
            }

            startI+=10;
            endI +=10;
            currPage++;
            renderReciepsList(responseArr.slice(startI,endI),foodListContainerEl);
            updateNextAndPrevPagesNumbers(currPage-1 , currPage+1);
            updateBtnVisibilityState(currPage ,totalPages);
            

    });

    prevPagingBtn.addEventListener("click",function(){
        
        if(currPage===1)
            {
                return;
            }

            startI-=10;
            endI -=10;
            currPage-=1;
            renderReciepsList(responseArr.slice(startI,endI),foodListContainerEl);
            updateNextAndPrevPagesNumbers(currPage-1 , currPage+1); 
            updateBtnVisibilityState(currPage ,totalPages);

    });
}

function search()
{
    // foodListContainerEl.innerHTML = "";
    let actualPage = 1;
    let startIndex = 0;
    let endIndex = 10;
    getReciepesListByName(searchInputEl.value).then(function(res){

        //get the number of pages based on result length
        let numOfPages =Math.floor (res.length/10);
        numOfPages = (res.length %10)!==0? numOfPages + 1 : numOfPages;

        //the message that shows up when no result found 
        let notFoundMsg = `<h1 class="no-result-message">⚠️
            No reciepes found for your Query please try again!</h1>`;
      
                if(res.length <=10)
                    {
                        renderReciepsList(res , foodListContainerEl,notFoundMsg);
                    }
                    else
                    {
                        updateBtnVisibilityState(actualPage , numOfPages);
                        renderReciepsList(res.slice(0,10),foodListContainerEl,notFoundMsg);
                        updateNextAndPrevPagesNumbers(actualPage-1,actualPage+1);
                        switchPages(res, actualPage ,numOfPages , startIndex , endIndex);
                        
                        
                    }
                 
         
       
    })
    //clear input field
    searchInputEl.value = '';
}

function performReciepesSearch()
{   
    searchBtnEl.addEventListener("click",function(){
        search();
        showMainSection();
    })

    document.addEventListener("keydown",function(e){
        if(e.key === "Enter" && searchInputEl.value)
            {
                search();
                showMainSection();
            }
    })
}

async function getReciepeById(id)
{
    try
    {
        let reciepeResponse = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`);
        if(!reciepeResponse.ok)
            {
                throw new Error(`${reciepeResponse.statusText}`);
            }
        
        let reciepeData = await reciepeResponse.json();
        return reciepeData;
    }
    catch(err)
    {
        
        return null
    }
}

function renderReciepeInMainPage(reciepe , servings)
{
    mainImageEl.src = reciepe.data.recipe.image_url;
    nameEl.textContent = reciepe.data.recipe.title;
    timeEl.textContent = ` ${reciepe.data.recipe.cooking_time} Minutes`;
    servingsEl.textContent  =` ${(servings)} persons`;
    publisherEl.textContent = `${reciepe.data.recipe.publisher}`;

    let ingredientsArr = reciepe.data.recipe.ingredients;
    ingredientsCtrEl.innerHTML = "";

    for(let ingredient of ingredientsArr)
        {
            //get the quantity per person to calculate the exact quantity based on the number of people
            let quantityPerPerson = (ingredient.quantity/4);

            //get the exact total quantity based on the number of servings 
            ingredient.quantity = ingredient.quantity?Number((quantityPerPerson*(servings)).toFixed(2)):"";
            if(ingredient.quantity===0.125)
                {
                    ingredient.quantity = "1/8";
                }
            else if(ingredient.quantity === 0.25 )
                {
                    ingredient.quantity = "1/4";
                }
            else if(ingredient.quantity===0.5)
                {
                    ingredient.quantity= "1/2";
                }
            let html = ` <p class="ingredent-element">
            <span class="check">&checkmark; </span>
            <span class="ingredient-quantity">${ingredient.quantity} </span> <span class="unit"> ${ingredient.unit} </span>
             ${ingredient.description}</p>`;
            ingredientsCtrEl.insertAdjacentHTML("beforeend", html);
        }
}

function switchBookMarksIcon()
{
     if( saveToBookMarksEl.dataset.name === "not-filled")
        {
            saveToBookMarksEl.src ="../icons/bookmark-black.png"
            saveToBookMarksEl.dataset.name ="filled"

           
        }
    else if(saveToBookMarksEl.dataset.name ==="filled" )
        {
            saveToBookMarksEl.src = "../icons/bookmark.png";
            saveToBookMarksEl.dataset.name = "not-filled"
        }
  
}

function updateBookMarkStatus(Reciepid)
{
    if(bookMarksArr.some(el=> el.id === Reciepid))
        {
            saveToBookMarksEl.src = "../icons/bookmark-black.png";
            saveToBookMarksEl.dataset.name = "filled";
        }
    else
        {
            saveToBookMarksEl.src = "../icons/bookmark.png";
            saveToBookMarksEl.dataset.name = "not-filled";
        }
}

function saveToLocalStorage(arr)
{
    localStorage.setItem("book-marks", JSON.stringify(arr));
}

function performReciepeSelection()
{
        let matchingReciepeId = "";
        let numOfServings = 4;

        foodListContainerEl.addEventListener("click",function(e){
            numOfServings = 4;

                
                    
                // no matter to attatch another event to the element because we are using closest methode
                    let foodItem  =e.target.closest(".food-list-item");
                    matchingReciepeId  = foodItem.dataset.reciepeId;
                   
                    getReciepeById(matchingReciepeId)
                    .then(function(res){
                        renderReciepeInMainPage(res,numOfServings);
                    });

                    updateBookMarkStatus(matchingReciepeId);
        });

        saveToBookMarksEl.addEventListener("click",function(){
                   
            if(bookMarksArr.some(el => el.id === matchingReciepeId))
                {
                      bookMarksArr = bookMarksArr.filter(el=> el.id !== matchingReciepeId);
                      console.log("bookmarks length", bookMarksArr.length);
                      renderReciepsList(bookMarksArr,bookMarksListCtrEl,msg);
                      saveToLocalStorage(bookMarksArr);
                }
            else
            {
                getReciepeById(matchingReciepeId).then(function(response){
                    bookMarksArr.push(new clsReciepe(matchingReciepeId,response.data.recipe.image_url,response.data.recipe.title,response.data.recipe.publisher));
                    renderReciepsList(bookMarksArr,bookMarksListCtrEl,msg);
                    saveToLocalStorage(bookMarksArr);
                   
                    });
                    

            }
           switchBookMarksIcon();
          
           
        });

        //increase servings
        increaseEl.addEventListener("click",function(){
            numOfServings++;
            getReciepeById(matchingReciepeId)
            .then(function(res){
                renderReciepeInMainPage(res,numOfServings);
            })
        });

        //decrease servings
        decreaseEl.addEventListener("click",function(){
            numOfServings--;
            getReciepeById(matchingReciepeId)
            .then(function(res){
                renderReciepeInMainPage(res,numOfServings);
            })
        });
       
}



function toogleBookMarksList()
{
    bookMarksListCtrEl.classList.toggle("hidden");
}

function ShowAndHideBookMarksList()
{
    
    bookMarksBtnEl.addEventListener("mouseenter",function(){
   toogleBookMarksList();
  
   });

    bookMarksBtnEl.addEventListener("mouseleave",function(){
        toogleBookMarksList();
    });

    bookMarksListCtrEl.addEventListener("mouseenter",function(){
        toogleBookMarksList();
 

    });

    bookMarksListCtrEl.addEventListener("mouseleave",function(){
    toogleBookMarksList();
});
}

function displayAddReciepeForm()
{
    addReciepeBtnEl.addEventListener("click",()=>{
        overlayEl.classList.remove("hidden");
        modelEl.classList.remove("hidden");
    });
}

function hideAddReciepeForm()
{
    closeBtnEl.addEventListener("click",()=>{
        overlayEl.classList.add("hidden");
        modelEl.classList.add("hidden");
    })
}



//call this function after searching for a reciepe in the text box
performReciepesSearch();

//calling this one after selecting a reciepe element from the left list section
performReciepeSelection();

//calling this one whenver the mouse either get in or out from the bookmarks button in the header
ShowAndHideBookMarksList();

//calling this one when we click the add reciepe button in the header
displayAddReciepeForm();

//calling this one when we click the close button in the form itself
hideAddReciepeForm();



