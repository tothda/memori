require 'rubygems'
require 'rack'
require 'rack/contrib'
require File.dirname(__FILE__) + "/memori.rb"

#log = File.new("sinatra.log", "w")
#STDOUT.reopen(log)
#STDERR.reopen(log)

set :run, false
set :environment, :development

use Rack::MethodOverride

run Sinatra::Application.new
