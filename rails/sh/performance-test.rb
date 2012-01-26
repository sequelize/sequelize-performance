require File.expand_path(File.dirname(__FILE__) + "/../config/environment")

LIMIT = 10000

def clear_table
  EntryRails.delete_all
end

def log(method, duration)
  puts "#{method} #{LIMIT} database entries serially took #{duration}ms."
end

def test_insert
  clear_table

  start = Time.now.to_f

  LIMIT.times do |i|
    EntryRails.create(:number => rand(99999), :string => 'asdasdad')
  end

  log('Adding', ((Time.now.to_f - start) * 1000).ceil)
end

def test_update
  entries = EntryRails.all
  start = Time.now.to_f

  entries.each do |entry|
    entry.update_attributes :number => rand(99999)
  end

  log('Updating', ((Time.now.to_f - start) * 1000).ceil)
end

def test_read
  start = Time.now.to_f

  EntryRails.find(:all)

  log('Reading', ((Time.now.to_f - start) * 1000).ceil)
end

def test_delete
  entries = EntryRails.all
  start = Time.now.to_f

  entries.each(&:destroy)

  log('Deleting', ((Time.now.to_f - start) * 1000).ceil)
end


test_insert
test_update
test_read
test_delete
