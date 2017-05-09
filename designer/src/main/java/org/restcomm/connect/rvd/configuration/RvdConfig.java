/*
 * TeleStax, Open Source Cloud Communications
 * Copyright 2011-2014, Telestax Inc and individual contributors
 * by the @authors tag.
 *
 * This program is free software: you can redistribute it and/or modify
 * under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of
 * the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

package org.restcomm.connect.rvd.configuration;

/**
 * Model class for loading configuration from rvd.xml
 *
 * @author otsakir@gmail.com - Orestis Tsakiridis
 */
public class RvdConfig {
    private String workspaceLocation;
    private String workspaceBackupLocation;
    private String sslMode;
    private String restcommBaseUrl;
    private String externalServiceTimeout;
    private Boolean videoSupport;
    private Integer maxMediaFileSize;

    public RvdConfig() {
    }

    public RvdConfig(String workspaceLocation, String workspaceBackupLocation, String restcommPublicIp, String sslMode) {
        super();
        this.workspaceLocation = workspaceLocation;
        this.workspaceBackupLocation = workspaceBackupLocation;
        this.sslMode = sslMode;
    }

    public String getWorkspaceLocation() {
        return workspaceLocation;
    }

    public String getWorkspaceBackupLocation() {
        return workspaceBackupLocation;
    }

    public String getSslMode() {
        return sslMode;
    }

    public String getRestcommBaseUrl() {
        return restcommBaseUrl;
    }

    public String getExternalServiceTimeout() {
        return externalServiceTimeout;
    }

    public Boolean getVideoSupport() {
        return videoSupport;
    }

    public Integer getMaxMediaFileSize() {
        return maxMediaFileSize;
    }
}
