require 'rubygems'
require 'rack'
require File.dirname(__FILE__) + "/memori.rb"
require File.dirname(__FILE__) + "/post_body_content_type_parser.rb"

set :run, false
set :environment, :production

use Rack::PostBodyContentTypeParser

run Sinatra::Application.new
