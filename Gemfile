source "https://rubygems.org"

# Core Jekyll engine
gem "jekyll"
gem "webrick", "~> 1.8"

# Your site's plugins
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-github-metadata"
end

# Windows-specific gems
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
  gem "wdm"
end