require 'rubygems'
require 'sinatra'
require 'couchrest'

couch = CouchRest.new("http://127.0.0.1:5984")

get '/' do
  couch.databases.join(",")
end

post '/users' do
  puts params[:test]
end
  
