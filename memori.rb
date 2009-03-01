# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'couchrest'
require 'sprockets'
# require 'ruby-debug'

module Memori
  class << self
    def root
      File.dirname(__FILE__)
    end
  end
end

require 'ruby/sprocket_app'

db = CouchRest.database!("http://127.0.0.1:5984/memori")

get '/' do
  "Hello világ!"
end

get '/javascripts/sprocket.js' do
  SprocketsApplication.source
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
  resp = db.view('db/user-sets', {:endkey => [author_id], :startkey => [author_id, "9999"], :descending => "true"})
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

