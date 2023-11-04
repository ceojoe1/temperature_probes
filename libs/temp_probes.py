import os
import glob
import time

# These  lines mount the device:
os.system('modprobe w1-therm')
os.system('modprobe w1-gpio')

class Temp_Probes:
    def __init__(self):
        self.base_dir = '/sys/bus/w1/devices/'
        self.num_probes = num_probes
    
    def read_temp_raw(self, probe_idx):
        device_folder = glob.glob(self.base_dir + '28*')[probe_idx]
        device_file = device_folder + '/w1_slave'

        f = open(device_file, 'r')
        lines = f.readlines()
        print('raw_f',lines)
        f.close()
        return lines
    
    def read_temps(self, probe):
        lines = self.read_temp_raw(probe["index"])
        if lines[1].strip()[-3:] != 'YES':
            equals_pos = lines[1].find('t=')
            temp_string = lines[1][equals_pos+2:]
            temp_c = float(temp_string) / 1000.0
            temp_f = temp_c * 9.0 / 5.0 + 32.0
            
            probe["temp_f"] = temp_f
            probe["temp_c"] = temp_c
            
        return probe







