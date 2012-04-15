module Memori
  class << self
    def root
      File.join(File.dirname(__FILE__), "..")
    end

    def version
      [0,1]
    end

    def config
      config_file = ENV["MEMORI_CONFIG"] || "memori.yml"
      @config ||= YAML.load(IO.read(File.join(Memori.root, "config", config_file))) || {}
    end
  end
end
