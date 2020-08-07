# Contains a Cron like nodejs service for cloning one user's recent music data to anothers (your's)

### Features and limitations
 * Supported sources are last.fm / libre.fm / listenbrainz.org
 * Max supported destinations are three unique accounts (one of each) last.fm, libre.fm, listenbrainz.org
 * Checks for updates every 15 seconds and posts the new data to your destination accounts.
 * See the [.example.env](.example.env) for more information

## Derived Directly from the [node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate) project