module Memori
  class << self
    def root
      File.join(File.dirname(__FILE__), "..")
    end

    def version
      [0,1]
    end

    def config
      @config ||= YAML.load(IO.read(File.join(Memori.root, "config", "memori.yml"))) || {}
    end
  end
end