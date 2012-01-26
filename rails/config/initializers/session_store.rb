# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_rails_session',
  :secret      => '99ca501660aaafa56b9ce592a7d83e7b68fb6e6003ace2874fcc8f83ecb8e06b0d10ec1bb8d743e0cd159cda1e1a1044eb1ae1fa68cb0f74233c5b8c0f377a84'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
