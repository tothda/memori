require 'rubygems'
require 'bundler'

Bundler.require

require "./ruby/memori"

@db = CouchRest.database!(Memori.config["database_url"])

#puts db.view('db/sets-by-user-and-date', {:limit => 1}).inspect

def process_set(set, offset, idx)
	version = set["version"]

	#puts "#{'%5d' % (offset + idx)}. #{set['_id']} #{set['title']} VERSION:#{version}"

	return if version == 2

	cards = set["cards"].map {|card|
		[
			card["front"],
			card["flip"],
			card["bucket"],
			card["result"],
			card["time"]
		]
	}
	# cards.each do |card|
	# 	puts card.inspect
	# end

	set["cards"] = cards
	set["version"] = 2

	@db.save_doc(set)
end

startkey = nil
startkey_docid = nil
batch_size = 100
loop_count = 0

while true do
	loop_count = loop_count + 1

	result = @db.view('db/sets-by-user-and-date', {
		:limit => batch_size+1, 
		:startkey_docid => startkey_docid,
		:startkey => startkey
	})

	offset = result["offset"]
	rows = result["rows"]
	num_rows = result["total_rows"]
	puts "total_rows: #{num_rows} offset: #{offset} row_count: #{rows.length} startkey_docid: #{startkey_docid}"
	for i in 0..(rows.length-2)
		row = rows[i]
		process_set(row["value"], offset, i)
	end

	startkey_docid = result["rows"][rows.length-1]["id"]
	startkey = result["rows"][rows.length-1]["key"]

	if offset + batch_size >= num_rows
		process_set(rows[rows.length-1]["value"], offset, rows.length-1)
		break
	end
end


