$(document).ready(function() {
    const url = 'https://www.forverkliga.se/JavaScript/api/crud.php';
    let accessKey='';
    let failCounter=0;
    let tempID='';
/*Inloggning */
    $('#requestKey').on('click', event => {
        const settings = {
            method: 'GET',
            data: {
                requestKey: ''
            },
        };
        $.ajax(url, settings)
        .done(keyRequestDone)
        .fail(whenFail)
        .always(getLibrary)
    });

    function keyRequestDone (data) {
        let object = JSON.parse(data);
        if (object.status==='error'){
            $('#loginError').text('Något gick fel, tryck igen')
            failCounter++;
            $('#failCounter').text(`Antal misslyckade försök: ${failCounter}`);
            $('#failMessage').append(`<li>${object.message}</li>`);
        } else {
            $('.goAway').css('display', 'none');
            $('.login').prepend(`<p>Din inloggningsnyckel är ${object.key}, skriv ner din nyckel så du kan logga in nästa gång</p>`);
            $('#OK').css('display', 'block');
            accessKey=object.key; 
        } 
    }
    $('#OK').on('click', event => {
        loggingIn();
    });
    /*Inloggning med lösenord */
    $('#loginKeyButton').on('click', loginKeyrequest);
    function loginKeyrequest (data){
        if ($('#loginKey').val()==='katt'){
            accessKey='EGC0p'
            loggingIn();
        } else {
            let password=$('#loginKey').val();
            accessKey=password;
            loggingIn();
        } 
    }

    function loggingIn () {
        $('.login').css('display', 'none');
        $('.library').css('display', 'block');
        $('.addBook').css('display', 'block');
        $('.arrows').css('display', 'block');
        $('.innerMenu').css('display', 'block');
        getLibrary();
    }
    /*Hämta biblioteket */
    $('#getList').on('click', getLibrary)

    function getLibrary () {
        const checkListSettings = {
            method: 'GET',
            data: {
                op: 'select',
                key: accessKey
            }
        }
        $.ajax(url, checkListSettings)
        .done(reloadLibrary)
        .fail(whenFail)
    }
    function reloadLibrary(data) {
        let object = JSON.parse(data);
        if (object.status==='error'){
            failCounter++;
            $('#failCounter').text(`Antal försök: ${failCounter}`);
            $('#failMessage').append(`<li>${object.message}</li>`);
            getLibrary();
        } else {
            $('#bookList').html('');
            $.each(object.data, function(index, value) {
                $('#bookList').append(`<li><p class="title">${value.title}</p><p class="author">${value.author}</p><button id="${value.id}" class="remove">Ta bort</button><button id="${value.id}" class="change">Korrigera bok</button></li>`);
            });
        }
    }
    /*Knappar för boklistan, Ta bort och korrigera */
    $('#bookList').click(event => {
        if (event.target.className==='remove'){
            let ID = event.target.id;
            removeThatBook(ID);
        } else if (event.target.className==='change'){
            let title=event.target.parentElement.firstChild.innerText;
            let author=event.target.parentElement.children[1].innerText;
            tempID = event.target.id;
            $('.changeBook').css('display', 'block');
            $('.library').css('display', 'none');
            $('#changeBookTitle').val(title);
            $('#changeBookAuthor').val(author);
        }
    });

    $('#rightArrow').on('click', event => {
        let firstElement=$('#bookList li').first().remove();
        $('#bookList').append(firstElement);
    });
    $('#leftArrow').on('click', event => {
        let lastElement=$('#bookList li').last().remove();
        $('#bookList').prepend(lastElement);
    });

    /*Lägg till ny bok */
    $('#newBook').on('click', fetchNewBook) 
    
    function fetchNewBook () {
        let title=$('#bookTitle').val();
        let author=$('#bookAuthor').val();
        const newBookSettings = {
            method: 'GET',
            data: {
               op: 'insert',
               key: accessKey,
               title: title,
               author: author 
            }
        }
        $.ajax(url, newBookSettings)
        .done(whenDone)
        .fail(whenFail)

        function whenDone (data){
            let object = JSON.parse(data);
            if (object.status==='error'){
                $('#bookSuccessId').text('');
                failCounter++;
                $('#failCounter').text(`Antal misslyckade försök: ${failCounter}`);
                $('#failMessage').append(`<li>${object.message}</li>`);
                fetchNewBook();
            } else {
                $('#infoDisplay').text(`Boken lades in i biblioteket med ID#${object.id}`);
                getLibrary();
            } 
        }
    }

/*Ta bort bok */
    $('#removeBookButton').on('click', removeThatBook)

    function removeThatBook (ID) {
        let bookId=ID;
        const removeBookSettings={
            method: 'GET',
            data: {
                op: 'delete',
                key: accessKey,
                id: bookId
            }
        }
        $.ajax(url, removeBookSettings)
        .done(removedBook)
        .fail(whenFail)
    
    
    function removedBook (data){
        let object = JSON.parse(data);
        if (object.status==='error'){
            $('#removeBookSpan').text('');
            failCounter++;
            $('#failCounter').text(`Antal misslyckade försök: ${failCounter}`);
            $('#failMessage').append(`<li>${object.message}</li>`);
        } else {
            $('#infoDisplay').text(`Boken är borttagen ur listan.`);
            getLibrary();
        }
    }
}
/*Korrigera bok */
    $('#changeBookButton').on('click', changeThatBook)
    $('#abortBookButton').on('click', event => {
        $('.library').css('display', 'block');
        $('.changeBook').css('display', 'none');
    });

    function changeThatBook () {
        let changeBookID = tempID;
        let newTitle = $('#changeBookTitle').val();
        let newAuthor = $('#changeBookAuthor').val();
        const changeBookSettings = {
            method: 'GET',
            data: {
                op: 'update',
                key: accessKey,
                id: changeBookID,
                title: newTitle,
                author: newAuthor
            }
        }
        $.ajax(url, changeBookSettings)
        .fail(whenFail)
        .done(data =>{
            let object = JSON.parse(data);
            if (object.status==='error'){
                $('#changeBookP').text('');
                failCounter++;
                $('#failCounter').text(`Antal misslyckade försök: ${failCounter}`);
                $('#failMessage').append(`<li>${object.message}</li>`);
            } else {
                $('#infoDisplay').text('Boken har korrigerats.');
                $('.library').css('display', 'block');
                $('.changeBook').css('display', 'none');
                getLibrary();
            }
        })
    }

}); //When loaded

function whenFail (data){
    let object = JSON.parse(data);
    console.log(`fel=${object.message}`);
    $('#infoDisplay').text('Något gick snett, försök igen om en stund.')
}

