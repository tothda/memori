# -*- coding: utf-8 -*-
ENV['TZ'] = 'Europe/Budapest'

require 'rubygems'
require 'sinatra'
require 'couchrest'
require 'sprockets'

set :app_file, __FILE__

require File.join(File.dirname(__FILE__), "ruby", "memori")
require "#{Memori.root}/ruby/sprocket_app"

def return_db_connection
  url = ENV["MEMORI_DB_URL"] || Memori.config["database_url"]
  CouchRest.database!(url)
end

db = return_db_connection()

helpers do
  def time_to_a(time)
    [time.year, time.month, time.day, time.hour, time.min, time.sec]
  end
end

get '/' do
  "Memori - version: #{Memori.version.join(".")}"
end

get '/memori.css' do
  content_type 'text/css', :charset => 'utf-8'
  sass :stylesheet
end

get '/faq' do
  haml :faq
end

get '/faq.html' do
  haml :faq
end

get '/memori.xml' do
  erb :gadget_xml
end

put '/users' do
  json = JSON.parse(params[:json])
  r = db.view('db/user-by-iwiw-id', {:key => json["iwiw_id"]})
  if r["rows"].length != 0
    o = {"id" => r["rows"][0]["id"]}
  else
    user = {
      :name => json["name"],
      :iwiw_id => json["iwiw_id"],
      :type => "user",
      :created_at => time_to_a(Time.new)
    }
    r = db.save_doc(user)
    o = {"id" => r["id"]}
  end
  JSON.dump o
end

post '/users/' do
  json = JSON.parse(params[:json])
  # iwiw_id-k tömbje
  iwiw_id_array = json["friends"]
  r = db.view 'db/user-by-iwiw-id', :keys => iwiw_id_array
  # id => objektum mappalés
  h = {}
  r["rows"].each do |row|
    id = row["id"]
    iwiw_id = row["value"]["iwiw_id"]
    h[id] = {"id" => id, "iwiw_id" => iwiw_id, "num_sets" => 0 }
  end
  user_id_array = r["rows"].map{|e| e["id"]}
  r2 = db.view 'db/num-sets-by-user', :keys => user_id_array, :group => true
  r2["rows"].each do |row|
    key = row["key"]
    value = row["value"]
    h[key]["num_sets"] = value
  end
  JSON.dump h.values
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
  resp = db.save_doc(map_set_to_v2(json))
  JSON.dump resp
end

get '/sets/' do
  json = JSON.parse(params[:json])
  resp = db.view('db/sets-by-user-and-date', json)
  JSON.dump map_sets_from_v2(resp)
end

get '/sets/:key' do
  resp = db.get params[:key]
  JSON.dump map_set_from_v2(resp)
end

put '/sets/:key' do
  json = JSON.parse(params[:json])
  json.delete("_method")
  resp = db.save_doc(map_set_to_v2(json))
  JSON.dump resp
end

delete '/sets/:key' do
  json = JSON.parse(params[:json])
  resp = db.delete_doc(json)
  JSON.dump resp
end

get '/remove' do
  iwiw_id = params[:id]
  r = db.view('db/user-by-iwiw-id', {:key => iwiw_id})
  if r["rows"].length == 1
    user = r["rows"][0]["value"]
    user["iwiw_id"] = nil
    user["deleted_at"] = time_to_a(Time.new)
    db.save_doc(user)
  end
  "OK"
end

def map_sets_from_v2(resp)
  # resp is a query response from couchdb
  rows = resp["rows"]

  rows.each do |row|
    row["value"] = map_set_from_v2(row["value"])
  end

  resp
end

def map_set_from_v2(set)
  # set version's is 2, we modify it in place to version 1
  # version 1 does not have the version field
  set.delete("version")
  
  # transform it's cards collection
  cards = set["cards"]
  unless cards.nil?
    cards_v1 = cards.map {|card|
      {"front" => card[0],
      "flip" => card[1],
      "bucket" => card[2],
      "result" => card[3],
      "time" => card[4]
      }
    }
    # and replace the old "cards" with the new entirely
    set["cards"] = cards_v1
  end
  # the modified set should be returned
  set
end

def map_set_to_v2(set)
  set["version"] = 2

  # transform it's cards collection
  cards = set["cards"]
  unless cards.nil?
    cards_v2 = cards.map {|card|
      [card["front"],
       card["flip"],
       card["bucket"],
       card["result"],
       card["time"]]
    }
    # and replace the old "cards" with the new entirely
    set["cards"] = cards_v2
  end
  
  set
end

