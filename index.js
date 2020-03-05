import fs from 'fs'
import path from 'path'

const fileName = process.env.npm_lifecycle_script.match(/\".+\"/)[0].replace(/"/g, '')

const filePath = path.join(__dirname, `./data/${fileName}.txt`)

let number = 0
let numberData

fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
    if (!err) {
    const librariesTotal = parseInt(data.match(/^.*/)[0].split(' ')[1])
    const daysTotal = parseInt(data.match(/^.*/)[0].split(' ')[2])
    const scores = data.match(/\n.*/)[0].replace(/\n/, '').split(' ')
    const booksTotal = scores.length

    const libraryData = data.replace(/^.*\n.*/, '').match(/\n.*\n.*/g)

    const libraries = libraryData.map((thisLibrary, i) => ({
        id: i,
        signup: parseInt(thisLibrary.match(/\n.*/)[0].replace(/\n/, '').split(' ')[1]),
        shipCount: parseInt(thisLibrary.match(/\n.*/)[0].replace(/\n/, '').split(' ')[2]),
        books: thisLibrary.match(/\n.*/g)[1].replace(/\n/, '').split(' ').map(book => ({
            id: book,
            value: parseInt(scores[parseInt(book)])
        })).sort((book1, book2) => {
            // console.log(book1.value, 'hellooo')
            // console.log(book2.value)
            return book2.value - book1.value
        })
    }))

    const libraryQueue = compute_metrics(libraries, scores)
    libraryQueue.pop()
    
// console.log(libraryQueue[libraryQueue.length -1])

    libraryQueue.sort((lib1, lib2) => {
        // console.log(lib1.x, lib2.x)
        return lib2.x - lib1.x
    })

    // libraryQueue.forEach(l => console.log(l.id, l.score))

    let daysCurrent = 0
    const libraryScanned = []
    let submittedBooks = {}
    let currentIndex = 0
    const bookIds = {}

    // let isSettingUp = false

    const activeLibraries = [];

    let daysUntilNextLibrary = libraryQueue[0].signup;


    for (let i = 0; i < daysTotal; i++) {

        if (!daysUntilNextLibrary) {
            
            activeLibraries.push(libraryQueue[activeLibraries.length])
            submittedBooks[libraryQueue[activeLibraries.length - 1].id] = []

            if (libraryQueue[activeLibraries.length]) {
                daysUntilNextLibrary = libraryQueue[activeLibraries.length].signup
            } else {
                daysUntilNextLibrary = Infinity
            }
        }
        
        activeLibraries.forEach((library, libraryIndex) => {
            // console.log(bookIds)
            library.books = library.books.filter(book => !bookIds[book.id])
            
            if (library.books.length) {
                for (let i = 0; i < library.shipCount; i++) {
                    if (library.books[i]) {
                        // console.log('adding', library.books[i].id, 'from', libraryQueue[libraryIndex].id)
                        bookIds[library.books[i].id] = true
                        submittedBooks[libraryQueue[libraryIndex].id].push(library.books[i])
                    }
                }
            }
        })



        daysUntilNextLibrary--
    }



    // while (daysCurrent < daysTotal && libraryQueue[currentIndex]) {

    //     console.log(currentIndex)
    //     libraryQueue.push(libraryQueue[currentIndex].id)
    //     daysCurrent+=libraryQueue[currentIndex].signup

    //     submittedBooks = [

    //     ]
        
    //     currentIndex++
    // }

    // console.log(submittedBooks)
    const outputLibraries = activeLibraries.filter(library => submittedBooks[parseInt(library.id)].length)

    const output = `${outputLibraries.length}
${
    outputLibraries.map((library, i) => `${library.id} ${submittedBooks[parseInt(library.id)].length}
${submittedBooks[parseInt(library.id)].map(({id}) => id).join(' ')}`).join('\n')
}`

console.log(Object.keys(submittedBooks).reduce((acc, lib) =>
    acc + submittedBooks[lib].reduce((acc, { id }) => parseInt(scores[id]) + acc, 0), 0))

fs.writeFile(`./data/${fileName}.out`, output, (err) => {
                if(err) {
                    return console.log(err);
                }
                
            // console.log(`File saved to ./data/${fileName}.out`);
        });
    // console.log(libraryQueue.length)
    // console.log(libraryQueue)

    // num of libs (libraryQueue.length)
    // [
    // [lib id] [num of books it will send]
    // id1 id2 id3
    // ]

    // console.log(JSON.stringify(libraries))
    // console.log(libraryQueue)

        // 6 2 7          // There are 6 books, 2 libraries, and 7 days for scanning
        // 1 2 3 6 5 4    // The scores of the books are 1, 2, 3, 6, 5, 4 (in order).

        // 5 2 2          // Library 0 has 5 books, the signup process takes 2 days
                          // and the library can ship 2 books per day.
        // 0 1 2 3 4      // The books in library 0 are: book 0, book 1, book 2, book 3, and book 4. 

        // 4 3 1          // Library 1 has 4 books, the signup process takes 3 days
                          //  and the library can ship 1 book per day.
        // 0 2 3 5        // The books in library 1 are: book 3, book 2, book 5 and book 0.

    } else {
        console.log('lol that dunt work', err)
    }
})

function compute_metrics(libraries, scores) {


  return libraries.map(lib => {
    const sum_of_scores = lib.books
      .map(({id}) => parseInt(scores[id]))
      .reduce((a, b) => a + b, 0);


    const num_books = lib.books.length;

    // console.log(sum_of_scores, num_books,lib.shipCount, lib.signup)

    const score = - lib.signup;

    // console.log(score)
    return {
      ...lib,
      x: score
    };
  });
}