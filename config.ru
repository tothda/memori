require 'rubygems'
require 'bundler'

Bundler.require

require './memori.rb'

set :run, false
set :environment, :development

use Rack::MethodOverride

run Sinatra::Application.new