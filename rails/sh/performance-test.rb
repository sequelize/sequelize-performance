require File.expand_path(File.dirname(__FILE__) + "/../config/environment")
require "parallel"

LIMIT = 10000

def clear_table
  EntryRails.delete_all
end

def log(method, duration, async=false)
  type = async ? 'async' : 'serially'
  puts "#{method} #{LIMIT} database entries #{type} took #{duration}ms."
end

def test_insert(async=false, disable_logging=false)
  clear_table

  start = Time.now.to_f

  if async
    Parallel.each((0...LIMIT).to_a, :in_threads => 10) do
      EntryRails.create(:number => rand(99999), :string => 'asdasdad')
    end
  else
    LIMIT.times do |i|
      EntryRails.create(:number => rand(99999), :string => 'asdasdad')
    end
  end

  unless disable_logging
    log('Adding', ((Time.now.to_f - start) * 1000).ceil, async)
  end
end

def test_update(async=false)
  entries = EntryRails.all
  start = Time.now.to_f

  if async
    Parallel.each(entries, :in_threads => 10) do |entry|
      entry.update_attributes :number => rand(99999)
    end
  else
    entries.each { |entry| entry.update_attributes :number => rand(99999) }
  end

  log('Updating', ((Time.now.to_f - start) * 1000).ceil, async)
end

def test_read
  start = Time.now.to_f

  EntryRails.find(:all)

  log('Reading', ((Time.now.to_f - start) * 1000).ceil)
end

def test_delete(async=false)
  test_insert(false, true)

  entries = EntryRails.all
  start = Time.now.to_f

  if async
    Parallel.each(entries, :in_threads => 10) do |entry|
      entry.destroy
    end
  else
    entries.each(&:destroy)
  end

  log('Deleting', ((Time.now.to_f - start) * 1000).ceil, async)
end


test_insert
test_insert(true)
test_update
test_update(true)
test_read
test_delete
test_delete(true)

