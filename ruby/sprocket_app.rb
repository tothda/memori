module SprocketsApplication
  class << self
    
    def source
      concatenation.to_s
    end
    
    def install_script
      concatenation.save_to(asset_path)
    end
    
    def install_assets
      secretary.install_assets
    end

    protected
      def secretary
        @secretary ||= Sprockets::Secretary.new(configuration.merge(:root => Memori.root))
      end
    
      def configuration
        YAML.load(IO.read(File.join(Memori.root, "config", "sprockets.yml"))) || {}
      end

      def concatenation
        secretary.reset! unless source_is_unchanged?
        secretary.concatenation
      end

      def asset_path
        File.join(Memori.root, "public", "sprockets.js")
      end

      def source_is_unchanged?
        previous_source_last_modified, @source_last_modified = 
          @source_last_modified, secretary.source_last_modified
          
        previous_source_last_modified == @source_last_modified
      end
  end
end
