require File.expand_path(File.dirname(__FILE__) + "/../config/environment")
require "parallel"

LIMIT = (ENV['LIMIT'] || 10000).to_i
TIMES = (ENV['TIMES'] || 2).to_i


def clear_table
  EntryRails.delete_all
end

def log(method, duration, async=false)
  type = async ? 'async' : 'serially'
  puts "#{method} #{LIMIT} database entries #{type} took #{duration}ms."
  duration
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

durations = []

TIMES.times do |i|
  puts "Running rails performance tests ##{i}"
  durations << {
    :insertSerially => test_insert,
    :insertAsync    => test_insert(true),
    :updateSerially => test_update,
    :updateAsync    => test_update(true),
    :read           => test_read,
    :deleteSerially => test_delete,
    :deleteAsync    => test_delete(true)
  }
end

durations.first.keys.each do |key|
  duration = durations.map{|d| d[key]}.sum/durations.size
  puts "Rails##{key} (#{TIMES} runs): #{duration}ms"
end
