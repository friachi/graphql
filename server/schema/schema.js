const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList
} = graphql;

const _ = require('lodash');


///////// data for testing ////////
var books = [
 {name: 'book1', genre: 'genre1', id: '1', authorId: '1'},
 {name: 'book2', genre: 'genre1', id: '2', authorId: '1'},
 {name: 'book3', genre: 'genre2', id: '3', authorId: '3'}

];

var authors = [
 {name: 'author1', age: '1', id: '1'},
 {name: 'author2', age: '1', id: '2'},
 {name: 'author3', age: '2', id: '3'}

];
////////////////////////////////////

//The Book
const BookType = new GraphQLObjectType({
    name : 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent,args){
                return _.find(authors, {id: parent.authorId});
                }
        }
    })
});

//The Author
const AuthorType = new GraphQLObjectType({
    name : 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent,args){
                return _.filter(books, {authorId: parent.id})
            }
        }
    })
});


////////////// The Root Query /////////////:/
const RootQuery = new GraphQLObjectType({
    name : 'RootQueryType',
    fields: {
        book: {
        type: BookType,
        args: {id: {type: GraphQLID}},
        resolve(parent,args){
            //code to get data from db
            return _.find(books, {id: args.id})
            }
        },
        author :{
        type: AuthorType,
        args: {id: {type: GraphQLID}},
        resolve(parent,args){
            return _.find(authors, {id: args.id})
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent,args){
                return books;
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent,args){
                return authors;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})