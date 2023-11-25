# Starting the Flask Server on Pi Boot Up
-- All configurations live:
 /etc/systemd/system/temp_probes_app.service

-- Refresh System changes: 
sudo systemctl daemon-reload

-- Enable service to start at boot: 
sudo systemctl enable temp_probes_app.service

-- Start the service:
sudo systemctl start temp_probes_app.service

-- Stop the service:
sudo systemctl stop temp_probes_app.service


-- Check the status of the service: 
sudo systemctl status temp_probes_app.service

-- Check the logs:
sudo journalctl -xe

-- Restart the service:
sudo systemctl restart temp_probes_app.service
