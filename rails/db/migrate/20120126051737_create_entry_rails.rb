class CreateEntryRails < ActiveRecord::Migration
  def self.up
    create_table :entry_rails do |t|
      t.integer :number
      t.string :string
      t.timestamps
    end
  end

  def self.down
    drop_table :entry_rails
  end
end
