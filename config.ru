require 'rubygems'
require 'rack'
require 'rack/contrib'
require File.dirname(__FILE__) + "/memori.rb"


set :run, false
set :environment, :production

use Rack::Static, :urls => ["/static"]

run Sinatra::Application.new
