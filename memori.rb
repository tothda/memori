# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'couchrest'

db = CouchRest.database!("http://127.0.0.1:5984/memori")

get '/' do
  "Hello világ!"
end

post '/users' do
  puts params[:test]
end

post '/sets/' do
  json = JSON.parse(params[:json])
  resp = db.save_doc(json)
  JSON.dump resp
end

get '/sets/' do
  author_id = params[:author_id]
  resp = db.view('db/user-sets', {:key => author_id})
  JSON.dump resp
end

get '/sets/:key' do
  resp = db.get params[:key]
  JSON.dump resp
end

put '/sets/:key' do
  json = JSON.parse(params[:json])
  resp = db.save_doc(json)
  JSON.dump resp
end

delete '/sets/:key' do
  json = JSON.parse(params[:json])
  resp = db.delete_doc(json)
  JSON.dump resp  
end

