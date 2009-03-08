# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'couchrest'
require 'sprockets'
require 'ruby-debug'

set :app_file, __FILE__

module Memori
  class << self
    def root
      File.dirname(__FILE__)
    end

    def version
      [0,1]
    end
  end
end

require 'ruby/sprocket_app'

db = CouchRest.database!("http://couch.dbx.hu:5984/memori")

get '/' do
  "Memori - version: #{Memori.version.join(".")}"
end

put '/users' do
  r = db.view('db/user-by-iwiw-id', {:key => params[:iwiw_id]})
  if r["rows"].length != 0
    o = {"id" => r["rows"][0]["id"]}
  else
    user = {
      :name => params[:name],
      :iwiw_id => params[:iwiw_id],
      :type => "user"
    }
    r = db.save_doc(user)
    o = {"id" => r["id"]}
  end
  JSON.dump o
end

get '/javascripts/sprocket.js' do
  SprocketsApplication.source
end

get '/users' do
  options.class.to_s
end

post '/sets/' do
  json = JSON.parse(params[:json])
  json.delete("_method")
  resp = db.save_doc(json)
  JSON.dump resp
end

get '/sets/' do
  user_id = params[:user_id]
  resp = db.view('db/sets-by-user-and-date', {:endkey => [user_id], :startkey => [user_id, "9999"], :descending => "true"})
  JSON.dump resp
end

get '/sets/:key' do
  resp = db.get params[:key]
  JSON.dump resp
end

put '/sets/:key' do
  json = JSON.parse(params[:json])
  json.delete("_method")
  resp = db.save_doc(json)
  JSON.dump resp
end

delete '/sets/:key' do
  json = JSON.parse(params[:json])
  resp = db.delete_doc(json)
  JSON.dump resp  
end

