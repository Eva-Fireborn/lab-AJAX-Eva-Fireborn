$(document).ready(function() {
    const url = 'https://www.forverkliga.se/JavaScript/api/crud.php';
    let accessKey='EGC0p';

    $('#requestKey').on('click', event => {
        const settings = {
            method: 'GET',
            data: {
                requestKey: ''
            },
        };
        $.ajax(url, settings)
        .done(keyRequestDone)
        .always(getLibrary)
    });

    function keyRequestDone (data) {
        console.log(data);
        let object = JSON.parse(data);
        console.log(object);
        $('.goAway').css('display', 'none')
        $('.login').prepend(`<p>Din inloggningsnyckel är ${object.key}, skriv ner din nyckel så du kan logga in nästa gång</p>`);
        $('#OK').css('display', 'block');
        accessKey=object.key;  
    }
    $('#OK').on('click', event => {
        loggingIn();
    });
    $('#loginKeyButton').on('click', loginKeyrequest);
    function loginKeyrequest (data){
        if ($('#loginKey').val()==='katt'){
            accessKey='EGC0p'
            loggingIn();
        } else {
            let password=$('#loginKey').val();
            console.log(password);
            accessKey=password;
            loggingIn();
        }
        
    }

    function loggingIn () {
        $('.login').css('display', 'none');
        $('.library').css('display', 'block');
        $('.addBook').css('display', 'block');
        $('.removeBook').css('display', 'block');
        $('.changeBook').css('display', 'block');
        getLibrary();
    }
    $('#newBook').on('click', event => {
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
        .always(getLibrary)

        function whenDone (data){
            let object = JSON.parse(data);
            console.log(object);
            $('#bookSuccessId').text(`Boken lades in i biblioteket med ID#${object.id}`);
        }
    });

    $('#getList').on('click', getLibrary)


    function getLibrary(){
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
    function reloadLibrary(data){
        console.log(data);
        let object = JSON.parse(data);
        $('#bookList').html('');
        $.each(object.data, function(index, value) {
        $('#bookList').append(`<li>${value.title}<br>${value.author}<br>id: ${value.id}</li>`);
        });
    }



    $('#removeBookButton').on('click', event => {
        let bookId=$('#removeBook').val();
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
        .always(getLibrary)

        function removedBook (data){
            console.log(data);
            let object = JSON.parse(data);
            $('#removeBookSpan').text(`Boken är borttagen ur listan.`)
        }
    });

    $('#changeBookButton').on('click', event => {
        let changeBookID=$('#changeBookId').val();
        let newTitle=$('#changeBookTitle').val();
        let newAuthor=$('#changeBookAuthor').val();
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
            console.log(data);
        })
        .always(getLibrary)
    })


    $('#rightArrow').on('click', event => {
        let firstElement=$('#bookList li').first().remove();
        $('#bookList').append(firstElement);
    });
    $('#leftArrow').on('click', event => {
        let lastElement=$('#bookList li').last().remove();
        $('#bookList').prepend(lastElement);
    });

}); //When loaded

function whenFail (data){
    let object = JSON.parse(data);
    console.log(`fel=${object.message}`);
}

